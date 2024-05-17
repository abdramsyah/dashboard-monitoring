// interface bufferCharacter {
//   time: number;
//   char: string;
// }

// interface buffer {
//   current: Array<bufferCharacter>;
// }

// export interface keyEvent {
//   pressedKey: string;
//   action: number;
//   keyCode: number;
// }

// interface config {
//   timeToEvaluate?: number; // Time to wait from last character to then trigger an evaluation of the buffer.
//   averageWaitTime?: number; //Average time between characters in milliseconds. Used to determine if input is from keyboard or a scanner. Defaults to 50ms.
//   startCharacter?: Array<number>; // Character that barcode scanner prefixes input with.
//   endCharacter?: Array<number>; // Character that barcode scanner suffixes input with. Defaults to line return.
//   onComplete: (code: string) => void; // Callback to use on complete scan input.
//   onError?: (error: string) => void; // Callback to use on error.
//   minLength?: number; // Minimum length a scanned code should be. Defaults to 0.
//   keyDownEvent?: keyEvent;
// }

// const useScanDetection = (config: config) => {
//   const {
//     timeToEvaluate = 100,
//     averageWaitTime = 50,
//     startCharacter = [],
//     endCharacter = [27],
//     onComplete,
//     onError,
//     minLength = 1,
//     keyDownEvent
//   } = config;

//   const dispatch = useDispatch();
//   const { scanMode } = useSelector((state: RootState) => state.scan);

//   const buffer: buffer = useRef([]);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const timeout: any = useRef(false);

//   const clearBuffer = () => {
//     buffer.current = [];
//   };

//   const evaluateBuffer = () => {
//     clearTimeout(timeout.current);
//     const sum = buffer.current
//       .map((buff, idx, arr) => (idx > 0 ? buff.time - arr[idx - 1].time : 0))
//       .slice(1)
//       .reduce((prev, curr) => prev + curr, 0);
//     const avg = sum / (buffer.current?.length - 1);
//     const code = buffer.current
//       .slice(startCharacter?.length > 0 ? 1 : 0)
//       .map(e => e?.char)
//       .join('');

//     LOG.info(
//       `evaluateBuffer - condition 1 sum: ${sum} avg: ${avg} averageWaitTime: ${averageWaitTime} code: ${code}`
//     );

//     if (
//       avg <= averageWaitTime &&
//       buffer.current.slice(startCharacter?.length > 0 ? 1 : 0)?.length >=
//         minLength
//     ) {
//       LOG.info('evaluateBuffer - onComplete');
//       onComplete(code);
//       dispatch(setScanMode(false));
//     } else {
//       !!onError && onError(code);
//       LOG.info('evaluateBuffer - onError');
//       dispatch(setScanMode(false));
//     }
//     clearBuffer();
//   };

//   const onKeyDown = useCallback(
//     (e?: keyEvent) => {
//       if (!!e) {
//         if (!scanMode) dispatch(setScanMode(true));
//         if (endCharacter.includes(e.keyCode)) {
//           evaluateBuffer();
//         }
//         if (
//           buffer.current?.length > 0 ||
//           startCharacter.includes(e.keyCode) ||
//           startCharacter?.length === 0
//         ) {
//           if (e.keyCode !== 59) {
//             clearTimeout(timeout.current);
//             timeout.current = setTimeout(evaluateBuffer, timeToEvaluate);

//             buffer.current.push({
//               time: performance.now(),
//               char: e?.pressedKey
//             });
//           }
//         }
//       }
//     },
//     [
//       startCharacter,
//       endCharacter,
//       timeToEvaluate,
//       onComplete,
//       onError,
//       minLength,
//       scanMode
//     ]
//   );

//   useEffect(() => {
//     return () => {
//       clearTimeout(timeout.current);
//     };
//   }, []);

//   useEffect(() => {
//     onKeyDown(keyDownEvent);
//   }, [keyDownEvent]);
// };

// const useScanDetection = (config: config) => {
//   const {
//     timeToEvaluate = 100,
//     // averageWaitTime = 50,
//     startCharacter = [],
//     endCharacter = [27],
//     onComplete,
//     onError,
//     minLength = 1,
//     keyDownEvent
//   } = config;

//   const dispatch = useDispatch();
//   const { scanMode } = useSelector((state: RootState) => state.scan);

//   const buffer = useRef<string[]>([]);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const timeout: any = useRef(false);

//   const clearBuffer = () => {
//     buffer.current = [];
//   };

//   const evaluateBuffer = () => {
//     clearTimeout(timeout.current);
//     const code = buffer.current
//       .slice(startCharacter?.length > 0 ? 1 : 0)
//       .join('');

//     // LOG.info(
//     //   `evaluateBuffer - condition 1 sum: ${sum} avg: ${avg} code: ${code}`
//     // );

//     if (
//       buffer.current.slice(startCharacter?.length > 0 ? 1 : 0)?.length >=
//       minLength
//     ) {
//       const perf1 = performance.now();

//       onComplete(code);
//       dispatch(setScanMode(false));

//       const perf2 = performance.now();

//       LOG.warn('evaluateBuffer - onComplete - performance', perf2 - perf1);
//     } else {
//       LOG.info('evaluateBuffer - onError');
//       !!onError && onError(code);
//       dispatch(setScanMode(false));
//     }
//     clearBuffer();
//   };

//   const onKeyDown = useCallback(
//     (e?: keyEvent) => {
//       if (!!e) {
//         if (!scanMode) dispatch(setScanMode(true));
//         if (endCharacter.includes(e.keyCode)) {
//           evaluateBuffer();
//         }
//         if (
//           buffer.current?.length > 0 ||
//           startCharacter.includes(e.keyCode) ||
//           startCharacter?.length === 0
//         ) {
//           if (e.keyCode !== 59) {
//             clearTimeout(timeout.current);
//             timeout.current = setTimeout(evaluateBuffer, timeToEvaluate);

//             // _.debounce(evaluateBuffer, timeToEvaluate);
//             buffer.current.push(e?.pressedKey);
//           }
//         }
//       }
//     },
//     [
//       startCharacter,
//       endCharacter,
//       timeToEvaluate,
//       onComplete,
//       onError,
//       minLength,
//       scanMode
//     ]
//   );

//   useEffect(() => {
//     return () => {
//       clearTimeout(timeout.current);
//     };
//   }, []);

//   useEffect(() => {
//     onKeyDown(keyDownEvent);
//   }, [keyDownEvent]);
// };

// export default useScanDetection;
