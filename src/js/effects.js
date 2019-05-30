import * as THREE from "three"

export class AnimationEffect {
  constructor(opts = {}) {
    this.name = opts.name || 'Unnamed'
    this.clock = null;
    this.direction = (opts.direction != null) ? opts.direction : 1; // 1 or -1
    this.startDirection = this.direction;
    this.speed = (opts.speed != null) ? opts.speed : 0.5;         // Seconds to move from min to max
    this.loop = false;                                            // loop it?
    this.value = (opts.value != null) ? opts.value : 0.5;         // 50% white and black

    this.minValue = (opts.minValue != null) ? opts.minValue : 0.0;
    this.maxValue = (opts.maxValue != null) ? opts.maxValue : 1.0;
  }

  set(value) {
    this.endAnimation();
    this.value = value;
  }

  add(value) {
    this.value += value;
  }

  startClock() {
    this.clock = new THREE.Clock();
    this.clock.start();
  }

  startAnimation(speed, direction=1) {
    this.speed = speed;
    this.direction = direction;
    this.startClock();
  }

  startLoop(speed=null) {
    this.speed = speed || this.speed;
    this.loop = true;
    this.startClock();
  }

  loopTo(value, speed=null, startDirection=1) {
    this.direction = startDirection;
    this.startDirection = startDirection;
    console.log(this.direction, this.startDirection);
    this.loop = true;
    this.stopAt = value;
    this.speed = speed || this.speed;
    this.startLoop(speed);
  }

  endAnimation() {
    console.log(`${this.name}: stopped`);
    this.loop = false;
    this.stopAt = null;
    this.startDirection = null;
    if(this.clock) { this.clock.stop(); }
    this.clock = null;
  }

  update() {
    if (this.clock != null) {
      // console.log(this.clock.getElapsedTime());
      let range = this.maxValue - this.minValue;
      this.value += range * this.direction * this.clock.getElapsedTime() / this.speed;
      // console.log(`${this.name}: ${this.value} ${range} ${this.direction} ${this.startDirection}`);


      if (this.stopAt != null) {
        // negative start direction, stop on way up
        if (this.startDirection < 0 && this.value > this.stopAt) {
          console.log(`${this.name}: stopped on way up, ${this.value}, ${this.stopAt}`);
          this.value = this.stopAt;
          this.endAnimation();
        }
        // positive start direction, stop on way down
        if (this.startDirection > 0 && this.value < this.stopAt) {
          console.log(`${this.name}: stopped on way up, ${this.value}, ${this.stopAt}`);
          this.value = this.stopAt;
          console.log(`${this.name}: stopped on way up, ${this.value}, ${this.stopAt}`);
          this.endAnimation();
        }
      }

      // Loop or stop when meeting value extents
      if (this.value >= this.maxValue || this.value <= this.minValue) {
        if (this.loop) {
          console.log(`${this.name}: switching direction`);
          this.startClock();
          this.direction *= -1;
        }
        else {
          this.endAnimation();
        }
      }
      if (this.value >= this.maxValue) { this.value = this.maxValue }
      if (this.value <= this.minValue) { this.value = this.minValue }
    }

    return this.value;
  }
}