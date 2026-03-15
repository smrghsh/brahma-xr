import * as THREE from "three";
import * as tilebelt from "@mapbox/tilebelt";
import ThreeGeo from "../Utils/ThreeGeo/index.js";
import Experience from "../Experience";
import SealPath from "./SealPath";
import bathyVertexShader from "../../shaders/bathy/vertex.glsl";
import bathyFragmentShader from "../../shaders/bathy/fragment.glsl";
// ThreeGeo used to be imported here as an external library, we modifed it to be imported from our modified version
export default class Geo {
  constructor() {
    this.tgeo = new ThreeGeo({
      tokenMapbox:
        "pk.eyJ1Ijoic2dob3NoMTciLCJhIjoiY2x4bTd0ajcxMDB4ejJyb2lsb2M5OTlqeCJ9.FJRCbhHv9jEaKZ_O87Rz4w",
    });
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.bathyGroup = new THREE.Group();
    this.bathyGroup.scale.set(0.85, 0.85, 0.85);
    this.geoGroup = new THREE.Group();
    const params = {
      view: "Satellite", // Default value
    };

    this.resources = this.experience.resources;

    this.scaling = new THREE.Vector3(10, 10, 10);

    this.origin = [36.708, -121.902];
    // this.origin = [39.0968, -120.0324];
    this.radius = 55.0;
    this.zoom = 9;
    //NOTES TO CHANGE
    this.bathyOffsetX = -0.5;
    this.bathyOffsetZ = 0.77;
    this.bathyGroup.position.x += 0.42;
    this.bathyGroup.position.y -= 0.08;

    // this.debugFolder = this.experience.debug.ui.addFolder("three-geo");
    // this.debugFolder
    //   .add(this.geoGroup, "visible")
    //   .name("visible")
    //   .onChange(() => {
    //     this.geoGroup.visible = this.geoGroup.visible;
    //   });
    // this.debugFolder.add(this.bathyGroup.position, "x", -10, 10).name("X Axis"); // Adjust min and max as needed
    // this.debugFolder.add(this.bathyGroup.position, "y", -10, 10).name("Y Axis"); // Adjust min and max as needed
    // this.debugFolder.add(this.bathyGroup.position, "z", -10, 10).name("Z Axis"); // Adjust min and max as needed
    // //scale of bathygroup, do all at same time
    // this.debugFolder.add(this.bathyGroup.scale, "x", 0, 10).name("X Scale"); // Adjust min and max as needed
    // this.debugFolder.add(this.bathyGroup.scale, "y", 0, 10).name("Y Scale"); // Adjust min and max as needed
    // this.debugFolder.add(this.bathyGroup.scale, "z", 0, 10).name("Z Scale"); // Adjust min and max as needed
    this.geoGroup.visible = true;
    this.scene.add(this.geoGroup);
    this.geoGroup.add(this.bathyGroup);
    this.loadTerrain().then(() => {
      console.log("loaded terrain");
      // the agents used to be placed here, but now its just done within the getTerrain function
      this.scene.add(this.geoGroup);
      this.loadBathy();
      this.loadSealData();
    });

    // then load the seal data
  }
  async loadTerrain() {
    console.log("loading terrain...");
    const terrain = await this.tgeo.getTerrainRgb(
      this.origin, // [lat, lng]
      this.radius, // radius of bounding circle (km)
      this.zoom
    ); // zoom resolution
    this.projection = this.tgeo.getProjection(this.origin, this.radius);
    // this.scene.add(this.links);
    // this.scene.add(this.agents);
    //rotate around X 90
    terrain.rotation.x = -Math.PI / 2;
    // scale it up 10x
    terrain.scale.copy(this.scaling);

    // this.geoGroup.add(terrain);
  }

  loadBathy() {
    function latLongToWebMercator(lat, lon) {
      const R = 6378137; // Earth's radius in meters
      const x = (R * lon * Math.PI) / 180;
      const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
      return [x, y];
    }

    console.log("loading bathy...");
    // const z = 11;
    // for (var x = 327; x < 333; x++) {
    //   for (var y = 795; y < 804; y++) {
    const tileZoom = 11;
    const tile = tilebelt.pointToTile(this.origin[1], this.origin[0], tileZoom); //Initial TILE IS IN THE MIDDLE NOTES TO CHANGE
    console.log(tile);
    let initialTileX = tile[0];
    let initialTileY = tile[1];
    for (let x = initialTileX - 3; x <= initialTileX + 1; x++) {
      for (let y = initialTileY - 3; y <= initialTileY + 3; y++) {
        const thisTile = [x, y, tileZoom];
        console.log(thisTile);
        const bbox = tilebelt.tileToBBOX(thisTile);
        let [x1, y1] = latLongToWebMercator(bbox[1], bbox[0]);
        let [x2, y2] = latLongToWebMercator(bbox[3], bbox[2]);
        const tileUrl1 = `https://cogserver-staging-myzvqet7ua-uw.a.run.app/get_rgb_tile/${thisTile[2]}/${thisTile[0]}/${thisTile[1]}.png?dataset=GlobalTopoBath.tif`;
        const tileUrl2 = `https://gis.ngdc.noaa.gov/arcgis/services/DEM_mosaics/DEM_global_mosaic_hillshade/ImageServer/WMSServer?bbox=${x1},${y1},${x2},${y2}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=512&height=512&layers=DEM_global_mosaic_hillshade:ColorHillshade`;
        const loader = new THREE.TextureLoader();
        const textures = [null, null]; // Array to store the loaded textures
        let loadedCount = 0; // Counter to track loaded textures
        const onTextureLoad = (index, texture) => {
          textures[index] = texture;
          loadedCount++;

          // When both textures are loaded, create the plane
          if (loadedCount === 2) {
            const plane = new THREE.Mesh(
              new THREE.PlaneGeometry(1, 1, 10, 10),
              new THREE.ShaderMaterial({
                vertexShader: bathyVertexShader,
                fragmentShader: bathyFragmentShader,
                uniforms: {
                  uTexture: { value: textures[0] },
                  uTexture2: { value: textures[1] }, //the second texture
                },
              })
            );

            console.log(bbox);
            let [xFromLatLong, zFromLatLong] = this.projection.proj([
              bbox[1],
              bbox[0],
            ]);
            //Hard coded magic numbers NOTES TO CHANGE
            const scaleX = 2.8;
            const scaleY = 2.8;
            plane.position.set(
              xFromLatLong + (x - initialTileX) * scaleX * 0.9,
              0.1,
              zFromLatLong + (y - initialTileY) * scaleY
            );
            plane.scale.set(scaleX, scaleY, scaleX);
            plane.position.x += this.bathyOffsetX;
            plane.position.z += this.bathyOffsetZ;
            plane.rotation.x = -Math.PI / 2;
            this.bathyGroup.add(plane);
          }
        };

        // Load the first texture
        loader.load(tileUrl1, (texture) => onTextureLoad(0, texture));

        // Load the second texture
        loader.load(tileUrl2, (texture) => onTextureLoad(1, texture));
        // loader.load(
        //   tileUrl,
        //   (texture) => {

        //   },
        //   undefined,
        //   (error) => {
        //     console.error("Error loading texture:", error);
        //   }
        // );
      }
    }

    // for (var x = 19; x <= 21; x++) {
    //   for (var y = 48; y <= 50; y++) {
    //     // const tileUrl = `https://cogserver-staging-myzvqet7ua-uw.a.run.app/get_rgb_tile/${z}/${x}/${y}.png?dataset=GlobalTopoBath.tif`;
    //     // for later, this is the shading URL
    //     // const tileUrl = `https://api.maptiler.com/tiles/terrain-rgb-v2/${z}/${x}/${y}.webp?key=iN7qgGinNxGHRLUk5Apg&mtsid=ce92d965-4625-4770-bc0e-b39b974631d9`;
    //     const bbox = tilebelt.tileToBBOX([x, y, z]);

    //     let [x1, y1] = latLongToWebMercator(bbox[1], bbox[0]);
    //     let [x2, y2] = latLongToWebMercator(bbox[3], bbox[2]);
    //     const tileUrl = `https://gis.ngdc.noaa.gov/arcgis/services/DEM_mosaics/DEM_global_mosaic_hillshade/ImageServer/WMSServer?bbox=${x1},${y1},${x2},${y2}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=512&height=512&layers=DEM_global_mosaic_hillshade:ColorHillshade`;

    //     // center is the avg of the bbox
    //     // const tileCenter = [(bbox[1] + bbox[3]) / 2, (bbox[0] + bbox[2]) / 2];
    //     const loader = new THREE.TextureLoader();
    //     loader.load(
    //       tileUrl,
    //       (texture) => {
    //         const plane = new THREE.Mesh(
    //           new THREE.PlaneGeometry(1, 1, 512, 512),
    //           // new THREE.ShaderMaterial({
    //           //   vertexShader: bathyVertexShader,
    //           //   fragmentShader: bathyFragmentShader,
    //           //   uniforms: {
    //           //     uTexture: { value: texture },
    //           //     uTexture2: { value: texture },
    //           //   },
    //           new THREE.MeshBasicMaterial({ map: texture })
    //         );
    //         console.log(bbox);
    //         let [xFromLatLong, zFromLatLong] = this.projection.proj([
    //           (bbox[1] + bbox[3]) / 2,
    //           (bbox[0] + bbox[2]) / 2,
    //           // bbox[2],
    //           // bbox[0],
    //         ]);

    //         plane.position.set(xFromLatLong, 2, zFromLatLong);
    //         plane.scale.set(1, 1, 1);
    //         plane.rotation.x = -Math.PI / 2;
    //         this.bathyGroup.add(plane);
    //       },
    //       undefined,
    //       (error) => {
    //         console.error("Error loading texture:", error);
    //       }
    //     );
    //   }
    // }
  }
  loadBathy2() {
    console.log("loading bathy...");
    console.log(this.projection);
    console.log(this.projection.bbox);
    const initialTile = tilebelt.bboxToTile(this.projection.bbox);
    // const initialTile = tilebelt.pointToTile(this.origin[1], this.origin[0], 3);
    console.log(this.projection.bbox);
    let tiles = [];
    tiles = tilebelt.getChildren(initialTile);
    while (tiles[0][2] < 10) {
      let newTiles = [];
      tiles.forEach((tile) => {
        newTiles.push(...tilebelt.getChildren(tile));
      });
      tiles = newTiles;
    }
    console.log(tiles);
    tiles.forEach((tile) => {
      const tileBbox = tilebelt.tileToBBOX(tile);

      const tileCenter = [
        (tileBbox[1] + tileBbox[3]) / 2,
        (tileBbox[0] + tileBbox[2]) / 2,
      ];

      // console.log(tileCenter);
      // Construct the URL for the tile
      const tileUrl = `https://cogserver-staging-myzvqet7ua-uw.a.run.app/get_rgb_tile/${tile[2]}/${tile[0]}/${tile[1]}.png?dataset=GlobalTopoBath.tif`;

      // Fetch the PNG texture and apply it to the plane
      const loader = new THREE.TextureLoader();
      loader.load(
        tileUrl,
        (texture) => {
          // console.log("Texture loaded:", texture);

          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.5, 10, 10),
            new THREE.ShaderMaterial({
              vertexShader: bathyVertexShader,
              fragmentShader: bathyFragmentShader,
              uniforms: {
                uTexture: { value: texture },
                uTexture2: { value: texture },
              },
              // no light

              // map: texture,
              // side: THREE.DoubleSide,
            })
            // new THREE.MeshBasicMaterial({ map: texture })
          );
          let [x, z] = this.projection.proj(tileCenter);
          plane.position.set(x, 2, -z);
          plane.rotation.x = -Math.PI / 2;
          this.bathyGroup.add(plane);
        },
        undefined, // Optional onProgress callback
        (error) => {
          console.error("Error loading texture:", error);
        }
      );
    });
  }
  loadSealData() {
    // array of all of the seal data in sources.js
    const sealDataArray = [
      "test31_FatiguedFiona-A",
      "test31_FatiguedFiona-B",
      "test31_FatiguedFiona-C",
      "test31_FatiguedFiona-D",
      "test31_FatiguedFiona-E",
      "test31_FatiguedFiona-F",
      "test31_FatiguedFiona-G",
      "test31_FatiguedFiona-H",
      "test31_FatiguedFiona-I",
      // "test33_HypoactiveHeidi-A",
      "test33_HypoactiveHeidi-B",
      "test33_HypoactiveHeidi-C",
      "test33_HypoactiveHeidi-D",
      "test33_HypoactiveHeidi-E",
      // "test33_HypoactiveHeidi-F",
      // "test33_HypoactiveHeidi-G",
      // "test33_HypoactiveHeidi-H",
      // "test33_HypoactiveHeidi-I",
      // "test35_JauntingJuliette-A",
      "test35_JauntingJuliette-B",
      "test35_JauntingJuliette-C",
      "test35_JauntingJuliette-D",
      "test35_JauntingJuliette-E",
      "test35_JauntingJuliette-F",
      "test35_JauntingJuliette-G",
      "test35_JauntingJuliette-H",
    ];
    for (const filename of sealDataArray) {
      // console.log(filename);
      const data = this.resources.items[filename].data;
      // console.log(data);
      this.sealPath = new SealPath(
        filename,
        data,
        this.projection,
        this.scaling
      );
    }
  }
}
