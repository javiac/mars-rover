import { useEffect, useState } from 'react';
import styles from './App.module.css';

const canvasWidth = 1000;
const canvasHeight = 800;
const cellSize = 50;

type Heading = 'NORTH' | 'SOUTH' | 'WEST' | 'EAST';

interface RoverStatus {
  x: number;
  y: number;
  heading: Heading;
}

function App() {
  const [userX, setUserX] = useState<number>(0);
  const [userY, setUserY] = useState<number>(0);
  const [userHeading, setUserHeading] = useState<Heading>();
  const [roverStatus, setRoverStatus] = useState<RoverStatus>();
  const [obstaclesInput, setObstaclesInput] = useState<string>();
  const [obstacles, setObstacles] = useState<number[][]>();

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
    }, 1000);
  }, []);

  useEffect(() => {
    if (roverStatus) {
      let c = document.getElementById('myCanvas') as HTMLCanvasElement;
      const ctx = c.getContext('2d');
      if (ctx) {
        const img = document.getElementById('rover') as HTMLImageElement;
        ctx.save();
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let angle = 0;
        console.log(roverStatus.heading);
        switch (roverStatus.heading) {
          case 'NORTH':
            angle = 0;
            break;
          case 'EAST':
            angle = 90;
            break;
          case 'SOUTH':
            angle = 180;
            break;
          case 'WEST':
            angle = 270;
            break;
        }
        ctx.translate(-scaleX(roverStatus.x) - img.width / 2, -scaleY(roverStatus.y) - img.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(img, scaleX(roverStatus.x), scaleY(roverStatus.y), cellSize, cellSize);
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
  }, [roverStatus, obstacles]);

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
      body: JSON.stringify({ x: userX, y: userY, heading: userHeading }),
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

  return (
    <div>
      <div className={styles.inputsContainer}>
        <input placeholder="Init x" onChange={(e) => setUserX(Number(e.target.value))} />
        <input placeholder="Init y" onChange={(e) => setUserY(Number(e.target.value))} />
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
      </div>
      <img id="rover" src="rover.png" alt="The Scream" className={styles.roverImage} />
      <canvas id="myCanvas" width={canvasWidth} height={canvasHeight} className={styles.canvas}></canvas>
    </div>
  );
}

export default App;
