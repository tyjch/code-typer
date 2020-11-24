import React, {useEffect, useRef, useState} from "react";
import TypeIt from "typeit";
import DiffMatchPatch from "diff-match-patch";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import '../App.css';

const differ = new DiffMatchPatch();

function Coder(props) {

	// region Props & State
	// props.code     - the new text to animate with TypeIt
	// props.language - the language to highlight the text with

	const typeItRef = useRef(null);                 // Instance of TypeIt
	const codeRef   = useRef(null);                 // Element that contains text to highlight
	const prismRef  = useRef(null);                 // Contains the highlighted elements

	const [running, setRunning] = useState(false);  // Whether TypeIt is still executing the animation
	const [text, setText]       = useState('');     // The text to actually display

	// endregion

	useEffect(() => {
		console.log('%cEFFECT: Code changed', 'color:green');

		if (!running) {
			let prev = codeRef.current.textContent;
			let diff = differ.diff_main(prev, props.code);
			let flag = prev.length === 0 ? true : false;

			typeItRef.current = new TypeIt(codeRef.current, {
				strings          : [],
				startDelay       : 0,
				nextStringDelay  : 750,
				loopDelay        : 750,
				speed            : 0,
				deleteSpeed      : 20,
				cursorSpeed      : 1000,
				cursorChar       : "\u2038",
				cursor           : true,
				lifeLike         : true,
				breakLines       : true,
				startDelete      : false,
				loop             : false,
				html             : true,
				waitUntilVisible : false,

				beforeStep       : (step, instance) => {
					// If not already running, set running to true before executing the step
					if (!running) {
						setRunning(true);
					}
					if (flag) {
						prismRef.current.textContent = codeRef.current.textContent;
						Prism.highlightElement(prismRef.current);
					}
				},
				afterStep        : (step, instance) => {

				},
				afterString      : (step, instance) => {
					// Takes time to re-type the previous string because TypeIt insists on clearing everything first
					// We set the flag to true when we wish to start propagating the changes to the prismRef
					flag = true;
				},
				afterComplete    : (step, instance) => {
					console.log('%cafterComplete()', 'color:blue');
					setRunning(false);
					instance.destroy();
				},
			});

			codeRef.current.textContent = prev;
			typeItRef.current.reset();
			typeItRef.current.move('START', {speed: 0});

			for (const d of diff) {
				const [op, text] = d;
				switch (op) {
					case  0 : {
						console.log(`%cMOVE   : ${text.length}`, 'color:red');
						typeItRef.current = typeItRef.current.move(text.length, {speed: 200});
						break;
					}
					case  1 : {
						console.log(`%cINSERT : ${text}`, 'color:red');
						typeItRef.current = typeItRef.current.type(text, {speed: 80});
						break;
					}
					case -1 : {
						console.log(`%cDELETE : ${text}`, 'color:red');
						typeItRef.current = typeItRef.current.move(text.length, {speed: 80}).delete(text.length, {speed: 80});
						break;
					}
					default : {
						break;
					}
				}
			}

			typeItRef.current.go();
		}

	}, [props.code])

	return (<>
		<pre><code ref={codeRef} style={{display: 'none'}} /></pre>
		<pre><code className={props.language} ref={prismRef} /></pre>
	</>);
}

export default Coder;
