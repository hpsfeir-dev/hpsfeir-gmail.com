/*
 * Tonhöhenerkennung: portiert aus @spotify/basic-pitch 1.0.1
 * (inference.ts + toMidi.ts), © Spotify AB, Apache License 2.0.
 * https://github.com/spotify/basic-pitch — siehe assets/model/NOTICE.md
 *
 * Inhaltlich unverändert auf die globale `tf`-Laufzeit umgeschrieben (statt
 * ES-Module mit externen Paket-Importen, die sich hier ohne Build-Schritt
 * nicht auflösen lassen). Die Portierung lässt addPitchBendsToNoteEvents()
 * weg — für Notenschrift sind Pitch-Bends (für MIDI-Wiedergabe gedacht)
 * ohne Nutzen.
 *
 * Läuft als klassisches Worker-Script (importScripts), weil tfjs als
 * UMD-Bundle kommt, kein ES-Modul.
 */

(() => {
  const OUTPUT_TO_TENSOR_NAME = {
    contours: 'Identity',
    onsets: 'Identity_2',
    frames: 'Identity_1',
  };

  const AUDIO_SAMPLE_RATE = 22050;
  const FFT_HOP = 256;
  const ANNOTATIONS_FPS = Math.floor(AUDIO_SAMPLE_RATE / FFT_HOP);
  const AUDIO_WINDOW_LENGTH_SECONDS = 2;
  const AUDIO_N_SAMPLES = AUDIO_SAMPLE_RATE * AUDIO_WINDOW_LENGTH_SECONDS - FFT_HOP;
  const N_OVERLAPPING_FRAMES = 30;
  const N_OVERLAP_OVER_2 = Math.floor(N_OVERLAPPING_FRAMES / 2);
  const OVERLAP_LENGTH_FRAMES = N_OVERLAPPING_FRAMES * FFT_HOP;
  const HOP_SIZE = AUDIO_N_SAMPLES - OVERLAP_LENGTH_FRAMES;

  const MIDI_OFFSET = 21;
  const ANNOT_N_FRAMES = ANNOTATIONS_FPS * AUDIO_WINDOW_LENGTH_SECONDS;
  const WINDOW_OFFSET =
    (FFT_HOP / AUDIO_SAMPLE_RATE) * (ANNOT_N_FRAMES - AUDIO_N_SAMPLES / FFT_HOP) + 0.0018;
  const MAX_FREQ_IDX = 87;

  class BasicPitch {
    constructor(modelUrl) {
      this.model = tf.loadGraphModel(modelUrl);
    }

    async evaluateSingleFrame(reshapedInput, batchNumber) {
      const model = await this.model;
      const singleBatch = tf.slice(reshapedInput, batchNumber, 1);
      const results = model.execute(singleBatch, [
        OUTPUT_TO_TENSOR_NAME.frames,
        OUTPUT_TO_TENSOR_NAME.onsets,
        OUTPUT_TO_TENSOR_NAME.contours,
      ]);
      singleBatch.dispose();
      return results;
    }

    async prepareData(singleChannelAudioData) {
      const wavSamples = tf.concat1d([
        tf.zeros([Math.floor(OVERLAP_LENGTH_FRAMES / 2)], 'float32'),
        tf.tensor(singleChannelAudioData),
      ]);
      const framed = tf.expandDims(
        tf.signal.frame(wavSamples, AUDIO_N_SAMPLES, HOP_SIZE, true, 0),
        -1,
      );
      wavSamples.dispose();
      return [framed, singleChannelAudioData.length];
    }

    unwrapOutput(result) {
      let rawOutput = result;
      rawOutput = result.slice(
        [0, N_OVERLAP_OVER_2, 0],
        [-1, result.shape[1] - 2 * N_OVERLAP_OVER_2, -1],
      );
      const outputShape = rawOutput.shape;
      const reshaped = rawOutput.reshape([outputShape[0] * outputShape[1], outputShape[2]]);
      rawOutput.dispose();
      return reshaped;
    }

    /**
     * 22050-Hz-Mono-Audio durch das Modell schicken, frameweise mit
     * Fortschritt. onComplete bekommt pro verarbeitetem Fenster die Matrizen,
     * nicht das Gesamtergebnis — die aufrufende Seite sammelt sie ein.
     */
    async evaluateModel(singleChannelAudioData, onComplete, percentCallback) {
      const [reshapedInput, audioOriginalLength] = await this.prepareData(singleChannelAudioData);
      const nOutputFramesOriginal = Math.floor(
        audioOriginalLength * (ANNOTATIONS_FPS / AUDIO_SAMPLE_RATE),
      );
      let calculatedFrames = 0;

      for (let i = 0; i < reshapedInput.shape[0]; ++i) {
        percentCallback(i / reshapedInput.shape[0]);
        const [resultingFrames, resultingOnsets, resultingContours] =
          await this.evaluateSingleFrame(reshapedInput, i);

        let unwrappedFrames = this.unwrapOutput(resultingFrames);
        let unwrappedOnsets = this.unwrapOutput(resultingOnsets);
        resultingFrames.dispose();
        resultingOnsets.dispose();
        resultingContours.dispose();

        const calculatedFramesTmp = unwrappedFrames.shape[0];
        if (calculatedFrames >= nOutputFramesOriginal) {
          unwrappedFrames.dispose();
          unwrappedOnsets.dispose();
          continue;
        }
        if (calculatedFramesTmp + calculatedFrames >= nOutputFramesOriginal) {
          const framesToOutput = nOutputFramesOriginal - calculatedFrames;
          const trimmedFrames = unwrappedFrames.slice([0, 0], [framesToOutput, -1]);
          const trimmedOnsets = unwrappedOnsets.slice([0, 0], [framesToOutput, -1]);
          unwrappedFrames.dispose();
          unwrappedOnsets.dispose();
          unwrappedFrames = trimmedFrames;
          unwrappedOnsets = trimmedOnsets;
        }
        calculatedFrames += calculatedFramesTmp;

        const framesArr = await unwrappedFrames.array();
        const onsetsArr = await unwrappedOnsets.array();
        unwrappedFrames.dispose();
        unwrappedOnsets.dispose();
        onComplete(framesArr, onsetsArr);
      }
      reshapedInput.dispose();
      percentCallback(1);
    }
  }

  // ---------- Hilfsfunktionen (1:1 aus toMidi.ts, numpy/scipy nachgebaut) ----------

  function argMax(arr) {
    return arr.length === 0
      ? null
      : arr.reduce((maxIndex, currentValue, index) => (arr[maxIndex] > currentValue ? maxIndex : index), -1);
  }

  function whereGreaterThanAxis1(arr2d, threshold) {
    const outputX = [];
    const outputY = [];
    for (let i = 0; i < arr2d.length; i++) {
      for (let j = 0; j < arr2d[i].length; j++) {
        if (arr2d[i][j] > threshold) {
          outputX.push(i);
          outputY.push(j);
        }
      }
    }
    return [outputX, outputY];
  }

  function meanStdDev(array) {
    const [sum, sumSquared, count] = array.reduce(
      (prev, row) => {
        const [rowSum, rowSumsSquared, rowCount] = row.reduce(
          (p, value) => [p[0] + value, p[1] + value * value, p[2] + 1],
          [0, 0, 0],
        );
        return [prev[0] + rowSum, prev[1] + rowSumsSquared, prev[2] + rowCount];
      },
      [0, 0, 0],
    );
    const mean = sum / count;
    const std = Math.sqrt((1 / (count - 1)) * (sumSquared - (sum * sum) / count));
    return [mean, std];
  }

  function globalMax(array) {
    return array.reduce((prev, row) => Math.max(prev, ...row), 0);
  }

  function min3dForAxis0(array) {
    const minArray = array[0].map((v) => v.slice());
    for (let x = 1; x < array.length; ++x) {
      for (let y = 0; y < array[0].length; ++y) {
        for (let z = 0; z < array[0][0].length; ++z) {
          minArray[y][z] = Math.min(minArray[y][z], array[x][y][z]);
        }
      }
    }
    return minArray;
  }

  function max3dForAxis0(array) {
    const maxArray = array[0].map((v) => v.slice());
    for (let x = 1; x < array.length; ++x) {
      for (let y = 0; y < array[0].length; ++y) {
        for (let z = 0; z < array[0][0].length; ++z) {
          maxArray[y][z] = Math.max(maxArray[y][z], array[x][y][z]);
        }
      }
    }
    return maxArray;
  }

  function argRelMax(array, order = 1) {
    const result = [];
    for (let col = 0; col < array[0].length; ++col) {
      for (let row = 0; row < array.length; ++row) {
        let isRelMax = true;
        for (
          let comparisonRow = Math.max(0, row - order);
          isRelMax && comparisonRow <= Math.min(array.length - 1, row + order);
          ++comparisonRow
        ) {
          if (comparisonRow !== row) isRelMax = isRelMax && array[row][col] > array[comparisonRow][col];
        }
        if (isRelMax) result.push([row, col]);
      }
    }
    return result;
  }

  function hzToMidi(hz) {
    return 12 * (Math.log2(hz) - Math.log2(440.0)) + 69;
  }

  function constrainFrequency(onsets, frames, maxFreq, minFreq) {
    if (maxFreq) {
      const maxFreqIdx = hzToMidi(maxFreq) - MIDI_OFFSET;
      for (let i = 0; i < onsets.length; i++) onsets[i].fill(0, maxFreqIdx);
      for (let i = 0; i < frames.length; i++) frames[i].fill(0, maxFreqIdx);
    }
    if (minFreq) {
      const minFreqIdx = hzToMidi(minFreq) - MIDI_OFFSET;
      for (let i = 0; i < onsets.length; i++) onsets[i].fill(0, 0, minFreqIdx);
      for (let i = 0; i < frames.length; i++) frames[i].fill(0, 0, minFreqIdx);
    }
  }

  function getInferredOnsets(onsets, frames, nDiff = 2) {
    const diffs = Array.from(Array(nDiff).keys())
      .map((n) => n + 1)
      .map((n) => {
        const framesAppended = Array(n).fill(Array(frames[0].length).fill(0)).concat(frames);
        const nPlus = framesAppended.slice(n);
        const minusN = framesAppended.slice(0, -n);
        return nPlus.map((row, r) => row.map((v, c) => v - minusN[r][c]));
      });

    let frameDiff = min3dForAxis0(diffs);
    frameDiff = frameDiff.map((row) => row.map((v) => Math.max(v, 0)));
    frameDiff = frameDiff.map((row, r) => (r < nDiff ? row.fill(0) : row));

    const onsetMax = globalMax(onsets);
    const frameDiffMax = globalMax(frameDiff);
    frameDiff = frameDiff.map((row) => row.map((v) => (onsetMax * v) / frameDiffMax));

    return max3dForAxis0([onsets, frameDiff]);
  }

  /**
   * Rohe Modellausgabe -> polyphone Notenereignisse (noch in "Frames", nicht
   * in Sekunden). 1:1 die Schwellwert-Logik aus basic-pitch.
   */
  function outputToNotesPoly(
    frames,
    onsets,
    onsetThresh = 0.5,
    frameThresh = 0.3,
    minNoteLen = 5,
    inferOnsets = true,
    maxFreq = null,
    minFreq = null,
    melodiaTrick = true,
    energyTolerance = 11,
  ) {
    let inferredFrameThresh = frameThresh;
    if (inferredFrameThresh === null) {
      const [mean, std] = meanStdDev(frames);
      inferredFrameThresh = mean + std;
    }

    const nFrames = frames.length;
    constrainFrequency(onsets, frames, maxFreq, minFreq);

    let inferredOnsets = onsets;
    if (inferOnsets) inferredOnsets = getInferredOnsets(onsets, frames);

    const peakThresholdMatrix = inferredOnsets.map((o) => o.map(() => 0));
    argRelMax(inferredOnsets).forEach(([row, col]) => {
      peakThresholdMatrix[row][col] = inferredOnsets[row][col];
    });

    const [noteStarts, freqIdxs] = whereGreaterThanAxis1(peakThresholdMatrix, onsetThresh);
    noteStarts.reverse();
    freqIdxs.reverse();

    const remainingEnergy = frames.map((frame) => frame.slice());

    const noteEvents = noteStarts
      .map((noteStartIdx, idx) => {
        const freqIdx = freqIdxs[idx];
        if (noteStartIdx >= nFrames - 1) return null;

        let i = noteStartIdx + 1;
        let k = 0;
        while (i < nFrames - 1 && k < energyTolerance) {
          if (remainingEnergy[i][freqIdx] < inferredFrameThresh) k += 1;
          else k = 0;
          i += 1;
        }
        i -= k;
        if (i - noteStartIdx <= minNoteLen) return null;

        for (let j = noteStartIdx; j < i; ++j) {
          remainingEnergy[j][freqIdx] = 0;
          if (freqIdx < MAX_FREQ_IDX) remainingEnergy[j][freqIdx + 1] = 0;
          if (freqIdx > 0) remainingEnergy[j][freqIdx - 1] = 0;
        }

        const amplitude =
          frames.slice(noteStartIdx, i).reduce((prev, row) => prev + row[freqIdx], 0) / (i - noteStartIdx);

        return { startFrame: noteStartIdx, durationFrames: i - noteStartIdx, pitchMidi: freqIdx + MIDI_OFFSET, amplitude };
      })
      .filter((n) => n !== null);

    if (melodiaTrick === true) {
      while (globalMax(remainingEnergy) > inferredFrameThresh) {
        const [iMid, freqIdx] = remainingEnergy.reduce(
          (prevCoord, currRow, rowIdx) => {
            const colMaxIdx = argMax(currRow);
            return currRow[colMaxIdx] > remainingEnergy[prevCoord[0]][prevCoord[1]] ? [rowIdx, colMaxIdx] : prevCoord;
          },
          [0, 0],
        );
        remainingEnergy[iMid][freqIdx] = 0;

        let i = iMid + 1;
        let k = 0;
        while (i < nFrames - 1 && k < energyTolerance) {
          if (remainingEnergy[i][freqIdx] < inferredFrameThresh) k += 1;
          else k = 0;
          remainingEnergy[i][freqIdx] = 0;
          if (freqIdx < MAX_FREQ_IDX) remainingEnergy[i][freqIdx + 1] = 0;
          if (freqIdx > 0) remainingEnergy[i][freqIdx - 1] = 0;
          i += 1;
        }
        const iEnd = i - 1 - k;

        i = iMid - 1;
        k = 0;
        while (i > 0 && k < energyTolerance) {
          if (remainingEnergy[i][freqIdx] < inferredFrameThresh) k += 1;
          else k = 0;
          remainingEnergy[i][freqIdx] = 0;
          if (freqIdx < MAX_FREQ_IDX) remainingEnergy[i][freqIdx + 1] = 0;
          if (freqIdx > 0) remainingEnergy[i][freqIdx - 1] = 0;
          i -= 1;
        }
        const iStart = i + 1 + k;
        if (iStart < 0 || iEnd >= nFrames) continue;

        const amplitude = frames.slice(iStart, iEnd).reduce((sum, row) => sum + row[freqIdx], 0) / (iEnd - iStart);
        if (iEnd - iStart <= minNoteLen) continue;

        noteEvents.push({ startFrame: iStart, durationFrames: iEnd - iStart, pitchMidi: freqIdx + MIDI_OFFSET, amplitude });
      }
    }

    return noteEvents;
  }

  function modelFrameToTime(frame) {
    return (frame * FFT_HOP) / AUDIO_SAMPLE_RATE - WINDOW_OFFSET * Math.floor(frame / ANNOT_N_FRAMES);
  }

  /** Noten von "Modell-Frames" auf echte Sekunden umrechnen. */
  function noteFramesToTime(notes) {
    return notes.map((note) => ({
      pitchMidi: note.pitchMidi,
      amplitude: note.amplitude,
      startTimeSeconds: modelFrameToTime(note.startFrame),
      durationSeconds: modelFrameToTime(note.startFrame + note.durationFrames) - modelFrameToTime(note.startFrame),
    }));
  }

  self.BasicPitch = { BasicPitch, outputToNotesPoly, noteFramesToTime, AUDIO_SAMPLE_RATE };
})();
