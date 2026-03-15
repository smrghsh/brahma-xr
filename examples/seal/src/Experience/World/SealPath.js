import * as THREE from "three";
import Experience from "../Experience";
import RaycastablePath from "../UI/RaycastablePath";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { Line2 } from "three/addons/lines/Line2.js";

export default class SealPath {
  constructor(name, sealData, projection, scaling) {
    this.name = name;
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.scene = this.experience.scene;
    this.sealPath = new THREE.Group();
    this.projection = projection;

    // Use provided scaling — now critical!
    this.scaling = scaling || new THREE.Vector3(1, 1, 1);
    this.scene.add(this.sealPath);

    // Scale Y dynamically based on max depth
    const maxDepth = Math.max(...sealData.map((d) => d.Depth || 0), 1);
    this.yScale = 0.1 / maxDepth; // Normalized depth scale for scene
    this.yBump = 0; // Adjust vertically if terrain sits higher/lower

    const points = [];
    const maxAllowedDepth = 2000;

    sealData.forEach((entry, i) => {
      if (
        !isFinite(entry.Depth) || entry.Depth < 0 || entry.Depth > maxAllowedDepth ||
        !isFinite(entry.Lat) || !isFinite(entry.Long)
      ) {
        //console.warn(`Skipping bad point at index ${i}:`, entry);
        return;
      }

      // Try using [Long, Lat] instead if results look wrong
      let [x, z] = this.projection.proj([entry.Lat, entry.Long]);

      const y = -entry.Depth * this.yScale + this.yBump;

      // Final transformed position
      const p = new THREE.Vector3(
        x * this.scaling.x,
        y,
        -z * this.scaling.z // negative z if projection is flipped
      );

      points.push(p);
    });

    if (points.length === 0) {
      console.warn(`No valid points for ${name}.`);
      return;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.computeBoundingSphere(); // ensures it's visible

    // Color coding
    this.color = new THREE.Color(0x0000ff);
    if (name.includes("Fiona")) {
      this.color = new THREE.Color("LightGreen");
    } else if (name.includes("Heidi")) {
      this.color = new THREE.Color("Blue");
    } else if (name.includes("Juliette")) {
      this.color = new THREE.Color("GoldenRod");
    }
    const material = new THREE.LineBasicMaterial({
      color: this.color,
      linewidth: 1, // NOTE: ignored in most platforms
    });

    this.line = new RaycastablePath(geometry, material);
    
    this.sealPath.add(this.line);

    // Position and scale adjustments

    // this.sealPath.scale.set(0.125, 0.1, 0.125);
    // this.sealPath.scale.copy(this.scaling);
    // this.sealPath.position.set(0, 0.5, 0);
    this.scene.add(this.sealPath);
    this.experience.raycastableObjects.push(this.line);
    this.line.raycastable = true;

    // this.debug = this.experience.debug;
    // this.debugFolder = this.debug.ui.addFolder(this.name);
    // this.debugFolder
    //   .add(this.sealPath, "visible")
    //   .name("visible")
    //   .onChange(() => {
    //     this.sealPath.visible = this.sealPath.visible;
    //   });
    // this.debugFolder.close();
    //show and hide
    // this.addBillboard(0, 0, 0);
  }
}
