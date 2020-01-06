import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import {Graph} from './Graph.js'

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      start: {},
      end: {},
      visitedNodes: [],
      path: [],
      phase: 1,
      addingWalls: false,
      drawingWalls: false,
      foundPath: []
    }
    this.handleClick = this.handleClick.bind(this);
    this.buttonPress = this.buttonPress.bind(this);
    this.handleLongPress = this.handleLongPress.bind(this);
    this.handlePressRelease = this.handlePressRelease.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
  }

  componentDidMount() {
    const copygrid = [];
    let counter = 0;
    for(let i = 0; i < 25; i++) {
      copygrid[i] = [];
      for (let j = 0; j < 25; j++) {
        copygrid[i][j] = {name: counter, isWall: false, row: i, col: j};
        counter++;
      }
    }
    this.setState({
      grid: copygrid,
    });
  }

  buttonPress(event) {
    // method to handle pressing of buttons. (only add wall button currently)
    const {name, value} = event.target;
    if (name === "addingWalls") {
      this.setState(prev => ({
        addingWalls: !prev.addingWalls
      }));
    }

  }

  handleLongPress(event) {
    if (this.state.addingWalls){
      this.buttonPressTimer = setTimeout(() => this.setState(prev => ({
        drawingWalls: true,
      })), 750);
    }
	}

	handlePressRelease() {
    clearTimeout(this.buttonPressTimer);
    this.setState({
      drawingWalls: false,
    });
  }
  
  handleMouseOver(key) {
    if (this.state.drawingWalls) {
      const copied = this.state.grid.slice();
      copied[key.row][key.col].isWall = true;
      this.setState({
        grid:copied,
      });
    }
  }


  handleClick(key) {
    if (this.state.phase === 1) {
      // set the starting node
      this.setState({ start: key, phase: 2});
    } else if (this.state.phase === 2) {
      // set the end node
      this.setState({ end: key, phase: 3});
    } else  {
      // start Dijkstra's Algorithm
      if ((this.state.start !== null && this.state.end !== null) && !this.state.addingWalls) {
        const graph = new Graph();
        graph.gridtoGraph(this.state.grid);
        const result = graph.shortestPath(this.state.start, this.state.end);
        // store the paths returned by Dijkstra's Algo
        this.setState({
          path: result[0],
          visitedNodes: result[1]
        });

        // render the search animation
        this.animate(result);
      } else {}
    }
  }

  animate(result) {
    /* This is the main animation function.
     * It animates both the search path and result path found by Dijkstra's
     * Algo.
     */

    /* @param {Array.<number[]>} an array where idx=0 is the search path and
     *  idx=1 is the result path.
     *
     * @return {undefined} this function does not return a value
     */

    const search_path = result[1];
    const result_path = result[0];

    // function wait is a promise wrapper for setTimeout.
    // it has the same functionality as setTimeout, but also returns a promise.
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Array to store promises returned from animating the
    // search path
    const promise_array = [];

    function animate_search(idx) {
      //  Animates the search path that Dijkstra's Algo takes.
      /*  @param {number} The current index of the search_path array being
       *  animated.
       *  @returns {undefined} This function does not return any value
      */

      var node_div = document.getElementById(search_path[idx]);
      if (node_div.className !== "Start" && node_div.className !== "End") {
        node_div.className = "Visited";
      } else {}
    }

    function animate_result() {
      //  Animates the result path found by Dijkstra's Algo.

      for (let i = 0; i < result_path.length; i++) {
        setTimeout( () => {
          var node_div = document.getElementById(result_path[i]);
          if (node_div.className === "Start" || node_div.className === "End") {
          } else {
            node_div.className = "Path";
          }
        }, 50 * i);
      }
    }

    // start animating the search path
    for (let i = 0; i < search_path.length; i++) {
      promise_array.push(wait(10 * i).then(() => animate_search(i)));
    }

    // After validating that all promises have been fulfilled (which means we
    // are done animating the search path), start animating the result path
    Promise.all(promise_array).then(animate_result);
  }



  render() {
    const rows = this.state.grid.map((row) =>
      <div className="RowContainer">
        { row.map( (element) => <Node
            key={element.name}
            element={element}
            isStart={this.state.start.name === element.name}
            isEnd={this.state.end.name === element.name}
            isWall={element.isWall}
            onClick={this.handleClick}
            onMouseDown={this.handleLongPress}
            onMouseUp={this.handlePressRelease}
            onMouseOver={this.handleMouseOver}
            />) }
      </div>);


    return(
      <div className="GameContainer">
        {rows}
        <Options buttonPress={this.buttonPress} addingWalls={this.state.addingWalls}/>
      </div>
      
    )
  }
}

class Node extends React.Component {
  render () {
    let node_state;

    if (this.props.isStart) {
      node_state = "Start";
    } else if (this.props.isEnd) {
      node_state = "End";
    } else if (this.props.isWall) {
      node_state = "Wall";
    } else {
      node_state = "Node";
    }

    return (
      <div className={ node_state }
        onClick={() => this.props.onClick(this.props.element)}
        id={this.props.element.name}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        onMouseOver={() => this.props.onMouseOver(this.props.element)}>
      </div>
    )
  }
}

function Options(props) {
  return(
    <button onClick={props.buttonPress} name="addingWalls">
      {props.addingWalls ? "Done" : "Add Walls"}
    </button>
  )
}



export default Grid;
