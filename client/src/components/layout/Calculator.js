import React, { useState, useEffect } from "react";
import io from "socket.io-client";

import Screen from "./screen/Screen";
import NumberPad from "./NumberPad/NumberPad";

const socket = io("http://localhost:5000/");

const Calculator = ({ results, setResults }) => {
  const [expression, setExpression] = useState("");

  useEffect(() => {
    socket.on("calc", (data) => {
      if (results.length === 10) results.shift();
      setResults(data);
    });
  }, [results, setResults]);

  const emitExpression = (exp) => {
    socket.emit("lstCalculation", {
      calculation: exp,
    });
    if (results.length === 10) results.shift();
    setResults([...results, exp]);
  };

  const handleCalcClicked = (event) => {
    switch (event) {
      case "D":
        setExpression(expression.slice(0, -1));
        break;

      case "C":
        setExpression("");
        break;

      case "=":
        calculate();
        break;

      default:
        setExpression(expression + "" + event);
        break;
    }
  };

  const calculate = () => {
    try {
      const result = eval(expression) | "";
      setExpression(result.toString());
      emitExpression(expression + " = " + result);
    } catch (err) {
      setExpression("error");
      emitExpression(expression + " = error");
    }
  };

  return (
    <div className="calculator">
      <Screen expression={expression} />
      <NumberPad handleButtonPress={handleCalcClicked} />
    </div>
  );
};

export default Calculator;
