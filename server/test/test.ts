import { Rover } from '../src/Rover';

const assert = require('assert');

describe('Rover', function () {
  describe('Navigation', function () {
    it('should initialize and return 1, 2, WEST', function () {
      const rover = new Rover(1, 2, 'WEST');
      const coordinates = rover.getStatus();
      assert.equal(coordinates.x, 1);
      assert.equal(coordinates.y, 2);
      assert.equal(coordinates.heading, 'WEST');
    });

    it('should run FLFFFRFLB and return 6, 4, NORTH', function () {
      const rover = new Rover(4, 2, 'EAST');
      rover.runCommands('FLFFFRFLB');
      assert.equal(rover.getStatus().x, 6);
      assert.equal(rover.getStatus().y, 4);
      assert.equal(rover.getStatus().heading, 'NORTH');
    });

    it('should stop and report 3, 4 WEST STOPPED', function () {
      const rover = new Rover(5, 4, 'WEST');

      rover.setObstacles([
        [1, 4],
        [3, 5],
        [7, 4]
      ]);
      rover.runCommands('FFFFFFFFFFF');

      const coordinates = rover.getStatus();
      assert.equal(coordinates.x, 2);
      assert.equal(coordinates.y, 4);
      assert.equal(coordinates.heading, 'WEST');
      assert.equal(coordinates.message, 'STOPPED');
    });

    it('should run commands and report report 10, 10, NORTH', function () {
      const rover = new Rover(0, 0, 'NORTH');

      rover.setObstacles([
        [3, 0],
        [3, 5],
        [7, 4]
      ]);
      rover.runCommands('RFLFFFRFFFLFFFFFFFRFFFFFFL');

      const coordinates = rover.getStatus();
      assert.equal(coordinates.x, 10);
      assert.equal(coordinates.y, 10);
      assert.equal(coordinates.heading, 'NORTH');
      assert.equal(coordinates.message, undefined);
    });

    it('should report 5, 5 after navigating avoiding obstacles', function () {
      const rover = new Rover(0, 0, 'NORTH');
      rover.setObstacles([
        [3, 0],
        [2, 1],
        [2, -1],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [4, 5],
        [4, 4],
        [5, 4],
        [6, 4],
        [6, 5],
        [4, 3],
        [6, 3]
      ]);

      const route = rover.navigate(5, 5, []);
      rover.followRoute(route);
      const status = rover.getStatus();
      assert.equal(status.x, 5);
      assert.equal(status.y, 5);
    });
  });
});
