import { useEffect, useState } from 'react';
import styles from './App.module.css';

const canvasWidth = 500;
const canvasHeight = 500;
const cellSize = 25;

type Heading = 'NORTH' | 'SOUTH' | 'WEST' | 'EAST';

interface RoverStatus {
  x: number;
  y: number;
  heading: Heading;
  message?: string;
}

function App() {
  const [userX, setUserX] = useState<number>(0);
  const [userY, setUserY] = useState<number>(0);
  const [userHeading, setUserHeading] = useState<Heading>();
  const [roverStatus, setRoverStatus] = useState<RoverStatus>();
  const [obstaclesInput, setObstaclesInput] = useState<string>();
  const [obstacles, setObstacles] = useState<number[][]>();
  const [commands, setCommands] = useState<string>();
  const [targetX, setTargetX] = useState<number>();
  const [targetY, setTargetY] = useState<number>();

  useEffect(() => {
    setInterval(async () => {
      const response = await fetch(`http://localhost:8080/rover/status`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      });
      const status = (await response.json()).status as RoverStatus;
      setRoverStatus(status);
    }, 500);
  }, []);

  useEffect(() => {
    if (roverStatus) {
      let c = document.getElementById('myCanvas') as HTMLCanvasElement;
      const ctx = c.getContext('2d');
      if (ctx) {
        const img = document.getElementById('rover') as HTMLImageElement;
        ctx.save();
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (targetX !== undefined && targetY !== undefined) {
          ctx.beginPath();
          ctx.fillStyle = 'green';
          ctx.arc(scaleX(targetX) + cellSize / 2, scaleY(targetY) + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#003300';
          ctx.stroke();
          ctx.fillStyle = 'black';
        }

        let angle = 0;
        let translateX = 0;
        let translateY = 0;
        const xIncrement = scaleX(roverStatus.x) + img.width / 2;
        const yIncrement = scaleY(roverStatus.y) + img.height / 2;
        switch (roverStatus.heading) {
          case 'NORTH':
            angle = 0;
            translateX = xIncrement;
            translateY = yIncrement;
            break;
          case 'EAST':
            angle = 90;
            translateX = yIncrement;
            translateY = -xIncrement;
            break;
          case 'SOUTH':
            angle = 180;
            translateX = -xIncrement;
            translateY = -yIncrement;
            break;
          case 'WEST':
            angle = 270;
            translateX = -yIncrement;
            translateY = xIncrement;
            break;
        }
        ctx.save();
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(translateX, translateY);
        ctx.drawImage(img, -img.width / 2, -img.height / 2, cellSize, cellSize);
        ctx.restore();
        for (let x = 0; x < canvasWidth; x += cellSize) {
          ctx.fillRect(x, 0, 1, canvasHeight);
        }

        for (let y = 0; y < canvasHeight; y += cellSize) {
          ctx.fillRect(0, y, canvasWidth, 1);
        }

        if (obstacles) {
          for (const obstacle of obstacles) {
            ctx.fillRect(scaleX(obstacle[0]), scaleY(obstacle[1]), cellSize, cellSize);
          }
        }
      }
    }
  }, [roverStatus, obstacles, targetX, targetY]);

  useEffect(() => {
    if (obstacles && obstacles.length > 0) {
      fetch(`http://localhost:8080/rover/obstacles`, {
        method: 'POST',
        body: JSON.stringify(obstacles),
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  }, [obstacles]);

  function initialize() {
    fetch(`http://localhost:8080/rover/initialize`, {
      method: 'POST',
      body: JSON.stringify({ x: userX, y: userY, heading: userHeading, obstacles }),
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  function scaleY(y: number) {
    return (
      ((0 - (canvasHeight - cellSize)) / ((canvasHeight - cellSize) / cellSize - 0)) * y + (canvasHeight - cellSize)
    );
  }

  function scaleX(x: number) {
    return x * cellSize;
  }

  function handleSetObstacles() {
    if (!obstaclesInput) {
      return;
    }

    let parsedObstacles = [];
    try {
      parsedObstacles = JSON.parse(obstaclesInput);
    } catch (e) {
      return;
    }

    setObstacles(parsedObstacles);
  }

  function handleSendCommands() {
    fetch(`http://localhost:8080/rover/commands`, {
      method: 'POST',
      body: JSON.stringify({ commands: commands }),
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  function handleNavigate() {
    fetch(`http://localhost:8080/rover/navigate`, {
      method: 'POST',
      body: JSON.stringify({ x: targetX, y: targetY }),
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  return (
    <div>
      <div className={styles.inputsContainer}>
        <input type="number" placeholder="Init x" onChange={(e) => setUserX(Number(e.target.value))} />
        <input type="number" placeholder="Init y" onChange={(e) => setUserY(Number(e.target.value))} />
        <form>
          <input
            type="radio"
            value="NORTH"
            id="north"
            onChange={(e) => setUserHeading(e.target.value as Heading)}
            name="heading"
          />
          <label htmlFor="north">North</label>
          <input
            type="radio"
            value="EAST"
            id="east"
            onChange={(e) => setUserHeading(e.target.value as Heading)}
            name="heading"
          />
          <label htmlFor="east">East</label>
          <input
            type="radio"
            value="WEST"
            id="west"
            onChange={(e) => setUserHeading(e.target.value as Heading)}
            name="heading"
          />
          <label htmlFor="west">West</label>
          <input
            type="radio"
            value="SOUTH"
            id="south"
            onChange={(e) => setUserHeading(e.target.value as Heading)}
            name="heading"
          />
          <label htmlFor="south">South</label>
        </form>
        <button onClick={initialize}> Initialize </button>
      </div>
      <div className={styles.inputContainer}>
        <input placeholder="Obstacles" onChange={(e) => setObstaclesInput(e.target.value)} />
        <button onClick={handleSetObstacles}> Set obstacles </button>
        <label>
          Ex: [ [3, 2], [2, 3], [2, 1], [1, 3], [0, 3], [-1, 3], [-1, 2], [-1, 1], [0, 1], [4, 5], [4, 4], [5, 4], [6,
          4], [6, 5], [4, 3], [6, 3] ]
        </label>
      </div>
      <div className={styles.inputContainer}>
        <input placeholder="Commands" onChange={(e) => setCommands(e.target.value)} />
        <button onClick={handleSendCommands}> Send commands </button>
        Ex: FFRFFLRRB
      </div>
      <div className={styles.inputContainer}>
        Message:
        {roverStatus && roverStatus.message ? roverStatus.message : ''}
      </div>
      <div className={styles.inputContainer}>
        <input type="number" placeholder="Target X" onChange={(e) => setTargetX(Number(e.target.value))} />
        <input type="number" placeholder="Target Y" onChange={(e) => setTargetY(Number(e.target.value))} />
        <button onClick={handleNavigate}> Navigate </button>
      </div>
      <img id="rover" src="rover.png" alt="Rover" className={styles.roverImage} width={cellSize} height={cellSize} />
      <canvas id="myCanvas" width={canvasWidth} height={canvasHeight} className={styles.canvas}></canvas>
    </div>
  );
}

export default App;
