import * as THREE from "three";
import Experience from "../Experience";
import Seal from "../World/Seal";
import RaycasterHandler from "../Utils/RaycastHandler";

export default class RaycastablePath extends THREE.Line {
  constructor(
    geometry,
    material,
    name = "not named",
    initialColor = 0x00ff00,
    hoveredColor = 0xff0000
  ) {
    super(geometry, material);
    this.initialColor = initialColor; // green (default)
    this.hoveredColor = hoveredColor; // red
    this.name = name;
    this.experience = new Experience();
    this.experience.raycastableObjects.push(this);
    this.hover = false;
    this.raycastable = true;
    if(this.material.color) {
      this.initialColor = this.material.color.clone();
      this.material.color.set(this.initialColor);
    }
    this.spawnSphere();
  }
  raycastEnter() {
    this.hover = true;
    this.material.color.set(this.hoveredColor);
    //console.log(this.name + " hovered");
    this.experience.controller?.pointerController?.padControls.pulse(25, 0.125);
  }
  raycastExit() {
    this.hover = false;
    this.material.color.set(this.initialColor);
    //console.log(this.name + " exited");
  }
  trigger(location) {
    //console.log(this.name + "triggered");
    if (this.marker) {
      console.log(location);
      this.setSphere(location);
    }
  }
  // spawnSphere() {
  //   this.marker = new THREE.Mesh(
  //       new THREE.SphereGeometry(0.02), // small radius
  //       new THREE.MeshBasicMaterial({ color: this.initialColor })
  //     );

  //     this.marker.visible = false;
  //     //this.experience.scene.add(this.marker);
  //     this.experience.scene.add(this.marker);
  //     console.log("Sphere spawned for " + this.name);
  // }
  spawnSphere() {
    this.marker = new Seal();
    this.marker.model.visible = false;
    this.experience.scene.add(this.marker.model);
  }
  setSphere(location) //location is a 3d vector
  {
    this.marker.model.position.copy(location);
    this.marker.model.position.y = this.marker.model.position.y - 0.005;
    this.marker.model.visible = true;
  }
  hideSphere()
  {
    this.marker.model.visible = false;
  }
  // dispose() {
  //   //TODO test, Copilot just hallucinated it
  //   this.experience.raycastableObjects =
  //     this.experience.raycastableObjects.filter((object) => object !== this);
  // }
}