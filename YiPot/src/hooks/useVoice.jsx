import { useCallback } from 'react';
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let source = null;

export const useVoice = () => {
    const playOrStop = useCallback((data) => {
        if (source) {
            // If playing, stop playback
            source.stop();
            source.disconnect();
            source = null;
        } else {
            // If not playing, start playback
            audioContext.decodeAudioData(new Uint8Array(data).buffer, (buffer) => {
                source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start();
                source.onended = () => {
                    source.disconnect();
                    source = null;
                };
            });
        }
    });

    return playOrStop;
};
