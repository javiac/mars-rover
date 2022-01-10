interface Status {
  x: number;
  y: number;
  heading: 'NORTH' | 'SOUTH' | 'WEST' | 'EAST';
  message?: string;
}

interface Point {
  x: number;
  y: number;
}

type Heading = 'NORTH' | 'SOUTH' | 'WEST' | 'EAST';

enum Command {
  left = 'L',
  back = 'B',
  right = 'R',
  forward = 'F'
}

const headings: Heading[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

export class Rover {
  private status: Status;
  private obstacles: boolean[][] = [];

  constructor(x: number, y: number, heading: Heading) {
    this.status = {
      x,
      y,
      heading
    };
  }

  public getStatus() {
    return this.status;
  }

  public runCommands(input: string) {
    const commands = input.split('');
    let xUpdate = this.status.x;
    let yUpdate = this.status.y;
    this.status.message = undefined;

    for (const command of commands) {
      switch (command) {
        case Command.forward:
          switch (this.status.heading) {
            case 'NORTH':
              yUpdate += 1;
              break;
            case 'SOUTH':
              yUpdate -= 1;
              break;
            case 'WEST':
              xUpdate -= 1;
              break;
            case 'EAST':
              xUpdate += 1;
              break;
          }
          break;
        case Command.back:
          switch (this.status.heading) {
            case 'NORTH':
              yUpdate -= 1;
              break;
            case 'SOUTH':
              yUpdate += 1;
              break;
            case 'WEST':
              xUpdate += 1;
              break;
            case 'EAST':
              xUpdate -= 1;
              break;
          }
          break;
        case Command.left:
          const index = headings.indexOf(this.status.heading);
          this.status.heading = headings[index > 0 ? index - 1 : 3];
          break;
        case Command.right:
          const index2 = headings.indexOf(this.status.heading);
          this.status.heading = headings[(index2 + 1) % 4];
          break;
        default:
          throw new Error('Unknown command ' + command);
      }

      if (this.isObstacle({ x: xUpdate, y: yUpdate })) {
        this.status.message = 'STOPPED';
        break;
      } else {
        this.status.x = xUpdate;
        this.status.y = yUpdate;
      }
    }
    return;
  }

  public setObstacles(obstacles: number[][]) {
    for (const obstacle of obstacles) {
      if (!this.obstacles[obstacle[0]]) {
        this.obstacles[obstacle[0]] = [];
      }
      this.obstacles[obstacle[0]][obstacle[1]] = true;
    }
  }

  public navigate(x: number, y: number, path: Point[]): Point[] {
    const lastPoint = path.length > 0 ? path[path.length - 1] : { x: this.status.x, y: this.status.y };

    if (lastPoint.x === x && lastPoint.y === y) {
      return path;
    }

    let positions: Point[] = [];
    const up: Point = { x: lastPoint.x, y: lastPoint.y + 1 };
    const right: Point = { x: lastPoint.x + 1, y: lastPoint.y };
    const left: Point = { x: lastPoint.x - 1, y: lastPoint.y };
    const down: Point = { x: lastPoint.x, y: lastPoint.y - 1 };

    if (lastPoint.x < x && lastPoint.y < y) {
      positions = [right, up, left, down];
    } else if (lastPoint.x === x && lastPoint.y < y) {
      positions = [up, right, left, down];
    } else if (lastPoint.x > x && lastPoint.y < y) {
      positions = [up, left, right, down];
    } else if (lastPoint.x > x && lastPoint.y === y) {
      positions = [left, up, down, right];
    } else if (lastPoint.x > x && lastPoint.y > y) {
      positions = [left, down, up, right];
    } else if (lastPoint.x === x && lastPoint.y > y) {
      positions = [down, right, left, up];
    } else if (lastPoint.x < x && lastPoint.y > y) {
      positions = [right, down, up, left];
    } else if (lastPoint.x < x && lastPoint.y === y) {
      positions = [right, up, down, left];
    }

    return this.tryPositions(positions, path, x, y);
  }

  public isObstacle(point: Point) {
    return this.obstacles[point.x] && this.obstacles[point.x][point.y];
  }

  public isInPath(point: Point, path: Point[]) {
    return (
      path.find((item) => item.x === point.x && item.y === point.y) !== undefined ||
      (point.x === this.status.x && point.y === this.status.y)
    );
  }

  public tryPositions(positions: Point[], path: Point[], x: number, y: number) {
    let route: Point[] = [];
    for (const position of positions) {
      if (!this.isObstacle(position) && !this.isInPath(position, path)) {
        route = this.navigate(x, y, [...path, position]);
        if (route.length > 0) {
          break;
        }
      }
    }

    return route;
  }

  public followRoute(route: Point[]) {
    for (const point of route) {
      const commands = this.moveToAdyacent(point);
      this.runCommands(commands);
    }
  }

  public moveToAdyacent(point: Point) {
    if (Math.abs(point.x - this.status.x) + Math.abs(point.y - this.status.y) !== 1) {
      throw new Error('Point not adyacent');
    }
    let command = '';

    if (point.x > this.status.x) {
      command = this.faceEast();
    } else if (point.x < this.status.x) {
      command = this.faceWest();
    } else if (point.y > this.status.y) {
      command = this.faceNorth();
    } else if (point.y < this.status.y) {
      command = this.faceSouth();
    }

    return command + Command.forward;
  }

  public faceNorth() {
    let command = '';
    switch (this.status.heading) {
      case 'NORTH':
        command = '';
        break;
      case 'SOUTH':
        command = 'RR';
        break;
      case 'WEST':
        command = 'R';
        break;
      case 'EAST':
        command = 'L';
        break;
    }
    return command;
  }

  public faceSouth() {
    let command = '';
    switch (this.status.heading) {
      case 'NORTH':
        command = 'RR';
        break;
      case 'SOUTH':
        command = '';
        break;
      case 'WEST':
        command = 'L';
        break;
      case 'EAST':
        command = 'R';
        break;
    }
    return command;
  }

  public faceWest() {
    let command = '';
    switch (this.status.heading) {
      case 'NORTH':
        command = 'L';
        break;
      case 'SOUTH':
        command = 'LL';
        break;
      case 'WEST':
        command = '';
        break;
      case 'EAST':
        command = 'RR';
        break;
    }
    return command;
  }

  public faceEast() {
    let command = '';
    switch (this.status.heading) {
      case 'NORTH':
        command = 'R';
        break;
      case 'SOUTH':
        command = 'L';
        break;
      case 'WEST':
        command = 'LL';
        break;
      case 'EAST':
        command = '';
        break;
    }
    return command;
  }
}
