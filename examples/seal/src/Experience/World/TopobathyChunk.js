import * as THREE from "three";
import Experience from "../Experience";

export default class TopobathyChunk {
  constructor() {
    console.log("TopobathyChunk constructor");
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.scene = this.experience.scene;
    this.plane = new THREE.PlaneGeometry(4, 4, 100, 100);
    this.material = new THREE.MeshBasicMaterial({
      color: 0x222222,
      wireframe: true,
    });
    this.mesh = new THREE.Mesh(this.plane, this.material);
    this.scene.add(this.mesh);
    this.mesh.rotation.x -= Math.PI / 2;
    this.mesh.position.y += 0.5;
  }
}
