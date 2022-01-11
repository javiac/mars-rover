import styles from './App.module.css';

function App() {
  return (
    <div>
    <img id="scream" src="img_the_scream.jpg" alt="The Scream" width="220" height="277" />
      <canvas id="myCanvas" width="250" height="300" className={styles.canvas}></canvas>
    </div>
  );
}

export default App;
