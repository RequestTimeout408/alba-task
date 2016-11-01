import React from 'react'
import _ from 'lodash'

// / 'import' cdn scripts, workaround for lint to pass
const THREE = window.THREE
const TWEEN = window.TWEEN

export default class Graph3D extends React.Component {

  constructor (props) {
    super(props)

    this.width = props.size
    this.height = props.size
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(
      this.width / -2,
      this.width / 2,
      this.height / 2,
      this.height / -2,
      1, 10000)
    this.allSpeheres = {}

    this.camera.position.set(this.width / 2, this.height / 2, -this.height * 10)
    this.camera.rotateZ(Math.PI)
    this.camera.rotateY(-Math.PI)

    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 0)
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.9)
    directionalLight.position.set(-1000, -1000, -1000)
    this.scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight(0x111111)
    this.scene.add(ambientLight)
  }

  render () {
    console.log('---- 3D ---- Re-rendering webgl root')
    return <div ref='holder' />
  }

  componentDidMount () {
    this.refs.holder.appendChild(this.renderer.domElement)
    this.glRender()
    this.handleProps(this.props, { expandedItems:{} })
  }

  shouldComponentUpdate (nextProps) {
    // / Make sure this view doesn't re-render
    return false
  }

  componentWillReceiveProps (nextProps) {
    this.handleProps(nextProps, this.props)
  }

  handleProps (nextProps, lastProps) {
    // / Clear view if we're loading new data
    if (nextProps.status !== 'done') {
      this.clear()
      return
    }

    // / Check if we need to reset the scene becasue of new items or items being cleared
    if (
      Object.values(this.allSpeheres).length === 0 ||
      !_.isEqual(nextProps.items, lastProps.items)
    ) {
      this.load(nextProps.items)
    }

    // / Check if the new props are triggering any animations (expandedItems have changed)
    if (!_.isEqual(nextProps.expandedItems, lastProps.expandedItems)) {
      console.log('---- 3D ---- Toggling items')
      Object.keys(nextProps.expandedItems).forEach(key => {
        const val = nextProps.expandedItems[key]
        if (this.props.expandedItems[key] !== val) {
          this.toggleItem(
            nextProps.items.find(d => d.data.name === key),
            val)
        }
      })
    }
  }

  clear () {
    // / Clear current scene
    Object.values(this.allSpeheres).forEach(s => {
      this.scene.remove(s)
    })
  }

  glRender () {
    this.renderer.render(this.scene, this.camera)
  }

  animate () {
    requestAnimationFrame(() => this.animate())
    TWEEN.update()
    this.glRender()
  }

  toggleItem (item, isToOpen) {
    if (!this.descendants) {
      return
    }

    TWEEN.getAll().forEach(t => t.stop())
    const rootSphere = this.allSpeheres[item.data.name]

    item && item.children && item.children.forEach(circle => {
      const sphere = this.allSpeheres[circle.data.name]
      const scale = item.r / circle.r
      const openedPos = {
        x: circle.x,
        y: circle.y,
        z: circle.depth * -this.height
      }
      const closedPos = {
        x: rootSphere.position.x,
        y: rootSphere.position.y,
        z: 0
      }

      const fromPos = isToOpen ? closedPos : openedPos
      const toPos = isToOpen ? openedPos : closedPos
      const fromScale = isToOpen ? scale : 1
      const toScale = isToOpen ? 1 : scale

      sphere.scale.set(fromScale, fromScale, fromScale)
      sphere.position.set(fromPos.x, fromPos.y, fromPos.z)

      new TWEEN.Tween(sphere.scale)
        .to({ x: toScale, y: toScale, z: toScale }, 400)
        .onStop(() => {
          sphere.scale.set(toScale, toScale, toScale)
        })
        .start()

      new TWEEN.Tween(sphere.position)
        .to(toPos, 400)
        .onStop(() => sphere.position.set(toPos.x, toPos.y, toPos.z))
        .start()
    })

    const rootVisFun = () => { rootSphere.visible = !isToOpen }
    if (isToOpen) {
      rootVisFun()
    } else {
      new TWEEN.Tween(rootSphere)
        .to({}, 400)
        .onComplete(rootVisFun)
        .onStop(rootVisFun)
        .start()
    }
  }

  load (descendants) {
    console.log('---- 3D ---- Adding props to scene')
    this.clear()

    // / Store current data
    this.descendants = descendants

    // / Render current data
    descendants.forEach(circle => {
      const sphereSegs = Math.pow(2, 7 - circle.depth)
      const geometry = new THREE.SphereBufferGeometry(circle.r, sphereSegs, sphereSegs)

      const material = new THREE.MeshPhongMaterial({
        color:0x1f77b4,
        side: THREE.DoubleSide,
        reflectivity: 0.6,
        shading: THREE.SmoothShading
      })

      const sphere = new THREE.Mesh(geometry, material)

      // / Store this sphere for accessing later
      this.allSpeheres[circle.data.name] = sphere

      sphere.position.set(circle.x, circle.y, 0 * -circle.depth * this.height)

      this.scene.add(sphere)
    })

    this.glRender()
    this.animate()
  }

}

Graph3D.propTypes = {
  items: React.PropTypes.array.isRequired,
  expandedItems: React.PropTypes.object.isRequired,
  status: React.PropTypes.string.isRequired,
  size: React.PropTypes.number.isRequired
}
