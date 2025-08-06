import Experience from '../Experience.js'
import * as THREE from 'three'

export default class Seal
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resource = this.resources.items.sealModel

        this.setModel()
    }
    setModel()
    {
        this.model = this.resource.scene
        console.log(this.model)
        this.model.scale.set(0.02, 0.02, 0.02)
        this.scene.add(this.model)
    }
    setAnimation()
    {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        this.animation.action = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.action.play()
    }
}