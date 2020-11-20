import React, {useEffect, useRef, useState, useImperativeHandle} from "react";
import TypeIt from "typeit";
import DiffMatchPatch from "diff-match-patch";
import './App.css'


const differ = new DiffMatchPatch();

const CodeTyper = React.forwardRef(({strings}, ref) => {

  const codeRef = useRef(null);
  const typeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    step() {
      console.log('`step()` called from imperative handle')
      if (typeRef.current !== null) {
        typeRef.current.unfreeze();
      }
    }
  }),)

  useEffect(() => {
    typeRef.current = new TypeIt(codeRef.current, {
      speed       : 50,
      // afterStep : (step, instance) => {
      //   console.log(step)
      // }
    });
    console.log('change this')
    // typeRef.current = typeRef.current.empty();
    let prev = '';

    for (const curr of strings) {
      typeRef.current = typeRef.current.move('START');
      let diff        = differ.diff_main(prev, curr);

      for (const d of diff) {
        const [op, text] = d;
        switch (op) {
          case  0 : {
            typeRef.current = typeRef.current.move(text.length);
            break;
          }
          case  1 : {
            console.log(`INSERT: ${text}`);
            typeRef.current = typeRef.current.type(text);
            break;
          }
          case -1 : {
            console.log(`DELETE: ${text}`);
            typeRef.current = typeRef.current.move(text.length).delete(text.length);
            break;
          }
          default : {
            break;
          }
        }
      }

      typeRef.current = typeRef.current.exec(() => {
        typeRef.current.freeze()
      })
      prev = curr;
    }

    typeRef.current.go();
    if (typeRef.current.is('completed')) {
      console.log('destroying typeit instance')
      typeRef.current.destroy();
    }

  }, [strings])

  return (
    <pre>
      <code ref={codeRef} />
    </pre>
  )

})

export default function App() {
  const typeRef = useRef(null);
  const strings = [
    `function foo(x) {
  return x + 1;
}`,
    `function bar(self, y) {
  return y + 1 * 2;
}`,
    `function recursive_bar(y) {
  return recursive_bar(y + 1);
}`,
  ]

  return (
      <div className="App">
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
        <button onClick={() => {typeRef.current.step()}}> Step </button>
        <CodeTyper strings={strings} ref={typeRef} />
      </div>
  );
}
