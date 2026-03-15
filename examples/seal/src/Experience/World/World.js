import * as THREE from "three";
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Floor from "./Floor.js";
import Stars from "./Stars.js";
import Geo from "./Geo.js";
import Raycastable from "../UI/Raycastable.js";
import SealPath from "./SealPath.js";
import TopobathyChunk from "./TopobathyChunk.js";
export default class World {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.floor = new Floor();
    // this.scene.add(new THREE.AxesHelper());
    // Wait for resources
    this.resources.on("ready", () => {
      // console.log("resources ready"); // used to be used to debug when or if resources were ready
      // this.topobathyChunk = new TopobathyChunk();

      this.stars = new Stars();
      this.geo = new Geo();
      this.environment = new Environment();
    });
  }
  update() {} //unused
}
