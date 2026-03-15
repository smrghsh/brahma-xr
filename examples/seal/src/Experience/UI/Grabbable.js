import * as THREE from "three";
import Experience from "../Experience"; // Adjust the import path if necessary

export default class Grabbable extends THREE.Mesh {
  constructor(geometry, material, name = "not named", color = 0xff0000) {
    super(geometry, material);
    this.geometry = geometry;
    this.name = name;
    this.OGColor = color;
    this.isGrabbed = false; // Indicates if this object is currently being dragged
    this.boundingBox = new THREE.Box3().setFromObject(this); // Create initial bounding box
    this.experience = new Experience(); // Get reference to Experience singleton
    // Debug: log the bounding box to ensure it's being set correctly
    console.log(`${this.name}'s bounding box:`, this.boundingBox);
    // Add this object to the grabbableObjects array
    this.experience.grabbableObjects.push(this);
    this.updateBoundingBox();

    this.helper = new THREE.Box3Helper(this.boundingBox, 0xffff00);
    this.experience.scene.add(this.helper);
  }

  updateBoundingBox() {
    if (this.geometry) {
      // Compute the bounding box for the geometry
      this.geometry.computeBoundingBox();
      // Now set the bounding box from the object, considering all transforms
      this.boundingBox
        .copy(this.geometry.boundingBox)
        .applyMatrix4(this.matrixWorld);
    } else {
      console.error("Geometry not found for", this.name);
    }
  }

  // Optional: color change when grabbing starts and stops
  onGrabStart() {
    // this.material.color.set(0x00ff00); // Change color when grabbing starts
  }

  onGrabEnd() {
    // this.material.color.set(this.OGColor); // Reset color when grabbing ends
  }
}
