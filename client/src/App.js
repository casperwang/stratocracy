import React, { Component, useEffect } from 'react';
import './App.css';

function Grid(props) {
  return (
    <button className={"grid" + (props.isActive === true ? " active" : "")} onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class GameMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeGrid: null,
    }
  }

  renderGrid(i) {
    return (
      <Grid
        value={this.props.grids[i].value} 
        isActive={this.state.activeGrid === i}
        onClick={() => this.handleClick(i)}
        key={"grid_" + i}
      />
    );
  }

  handleClick(i) {
    this.setState({
      activeGrid: i,
    });
  }

  render() {
    return (
      <div>
        {[...Array(this.props.mapSize.r)].map((x, i) =>
          <div className="board-row" key={"row_" + i}>
            {[...Array(this.props.mapSize.c)].map((x, j) =>
              this.renderGrid(i * this.props.mapSize.c + j)
            )}
          </div>
        )}
      </div>
    );
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      playerCount: props.playerCount,
      mapSize: props.mapSize,
      grids: props.grids
    };
  }

  render() {
    const current = this.state.grids;
    return (
      <div className="game">
        <div className="game-map">
          <GameMap
            grids={current}
            mapSize={this.state.mapSize}
          />
        </div>
        <div className="game-info">
        </div>
      </div>
    );
  }
}

export default Game;