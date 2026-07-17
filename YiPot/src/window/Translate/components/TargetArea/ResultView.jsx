import { HiOutlineVolumeUp } from 'react-icons/hi';

export default function ResultView({ result, error, textAreaRef, appFontSize, speak }) {
    return (
        <>
            {typeof result === 'string' ? (
                <textarea
                    ref={textAreaRef}
                    className={`text-[${appFontSize}px] h-0 resize-none bg-transparent select-text outline-none`}
                    readOnly
                    value={result}
                />
            ) : (
                <div>
                    {result['pronunciations']?.map((pronunciation, i) => (
                        <div key={i}>
                            {pronunciation['region'] && (
                                <span className={`text-[${appFontSize}px] mr-[12px] text-default-500`}>
                                    {pronunciation['region']}
                                </span>
                            )}
                            {pronunciation['symbol'] && (
                                <span className={`text-[${appFontSize}px] mr-[12px] text-default-500`}>
                                    {pronunciation['symbol']}
                                </span>
                            )}
                            {pronunciation['voice'] && pronunciation['voice'] !== '' && (
                                <HiOutlineVolumeUp
                                    className={`text-[${appFontSize}px] inline-block my-auto cursor-pointer`}
                                    onClick={() => speak(pronunciation['voice'])}
                                />
                            )}
                        </div>
                    ))}
                    {result['explanations']?.map((explanation) => (
                        <div key={explanation['trait']}>
                            {explanation['explains']?.map((explain, index) => (
                                <span key={index}>
                                    {index === 0 ? (
                                        <>
                                            <span className={`text-[${appFontSize - 2}px] text-default-500 mr-[12px]`}>
                                                {explanation['trait']}
                                            </span>
                                            <span className={`font-bold text-[${appFontSize}px] select-text`}>
                                                {explain}
                                            </span>
                                            <br />
                                        </>
                                    ) : (
                                        <span className={`text-[${appFontSize - 2}px] text-default-500 select-text mr-1`}>
                                            {explain}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    ))}
                    <br />
                    {result['associations']?.map((association, i) => (
                        <div key={i}>
                            <span className={`text-[${appFontSize}px] text-default-500`}>
                                {association}
                            </span>
                        </div>
                    ))}
                    {result['sentence']?.map((sentence, index) => (
                        <div key={index}>
                            <span className={`text-[${appFontSize - 2}px] mr-[12px]`}>
                                {index + 1}.
                            </span>
                            {sentence['source'] && (
                                <span
                                    className={`text-[${appFontSize}px] select-text`}
                                    dangerouslySetInnerHTML={{ __html: sentence['source'] }}
                                />
                            )}
                            {sentence['target'] && (
                                <div
                                    className={`text-[${appFontSize}px] select-text text-default-500`}
                                    dangerouslySetInnerHTML={{ __html: sentence['target'] }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
            {error !== '' &&
                error.split('\n').map((v, i) => (
                    <p key={i} className={`text-[${appFontSize}px] text-red-500`}>
                        {v}
                    </p>
                ))}
        </>
    );
}
