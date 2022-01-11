import { useEffect, useState } from 'react';
import styles from './App.module.css';

const canvasWidth = 1000;
const canvasHeight = 800;

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
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, roverStatus.x, roverStatus.y);
      }
    }
  }, [roverStatus]);

  async function initialize() {
    await fetch(`http://localhost:8080/rover/initialize`, {
      method: 'POST',
      body: JSON.stringify({ x: userX, y: userY, heading: userHeading }),
      headers: {
        'content-type': 'application/json'
      }
    });
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
      <img id="rover" src="rover.png" alt="The Scream" width="100" height="100" className={styles.roverImage} />
      <canvas id="myCanvas" width={canvasWidth} height={canvasHeight} className={styles.canvas}></canvas>
    </div>
  );
}

export default App;
