import React from 'react'
import './GraphView.scss'


let demo = {};

function safeClassName(n){
  //TODO:dont use this shit...
  return "__"+(n+"-")
    .split('.').join('__')
    .split('#').join('__')
    .split('+').join('__');
}

class Orbs3D {

  constructor(holder) {
    this.holder = holder;
    this.width = 500;
    this.height = 500;
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      this.width / -2,
      this.width / 2,
      this.height / 2,
      this.height / -2,
      1, 10000);
    this.allSpeheres = [];

    this.camera.position.set(this.width / 2, this.height / 2, -this.height * 10);
    this.camera.rotateZ(Math.PI);
    this.camera.rotateY(-Math.PI);


    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xFFFFFF);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
    this.renderer.shadowMapType = THREE.PCFShadowMap;
    this.renderer.shadowMapAutoUpdate = true;

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, .9);
    directionalLight.position.set(-1000, -1000, -1000);
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x111111);
    this.scene.add(ambientLight);

    this.holder.appendChild(this.renderer.domElement);
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  animate() {
    requestAnimationFrame(()=>this.animate());
    TWEEN.update();
    this.render();
  }

  openByName(name) {
    if (!this.descendants) {
      return;
    }

    /// root->js
    const root = this.descendants.find(c=>(c.data.name === name));

    if (root.depth !== 0 && !root.data.isExpanded) {
      const parent = this.descendants.find(c=> {
        return c.children && c.children.indexOf(root) >= 0
      });
      this.openByName(parent.data.name);
      return;
    }

    const rootSphere = this.allSpeheres[root.data.name];

    root && root.children && root.children.forEach(circle => {

      if (circle.data.isExpanded) {
        return;
      }
      circle.data.isExpanded = true;
      const sphere = this.allSpeheres[circle.data.name];
      const scale = root.r / circle.r;

      sphere.scale.set(scale, scale, scale);
      sphere.position.set(
        rootSphere.position.x,
        rootSphere.position.y,
        circle.depth * -this.height);

      new TWEEN.Tween(sphere.scale)
        .to({x: 1, y: 1, z: 1}, 400)
        .easing(TWEEN.Easing.Linear.None)
        .start();

      new TWEEN.Tween(sphere.position)
        .to({x: circle.x, y: circle.y, z: circle.depth * -this.height}, 400)
        .easing(TWEEN.Easing.Linear.None)
        .start();

      rootSphere.visible = false;
    });


  }

  load(descendants) {

    this.descendants = descendants;

    descendants.forEach(circle => {
      const spehereSegs = Math.pow(2, 7 - circle.depth);
      const geometry = new THREE.SphereGeometry(circle.r, spehereSegs, spehereSegs);

      const material = new THREE.MeshPhongMaterial({
        color: circle.children || true ? 0x1f77b4 : 0xff7f0e,
        //emissive: 0x001111,
        side: THREE.DoubleSide,
        reflectivity: .6,
        shading: THREE.SmoothShading
      })

      const sphere = new THREE.Mesh(geometry, material);

      this.allSpeheres[circle.data.name] = sphere;

      sphere.position.set(circle.x, circle.y, 0 * -circle.depth * this.height);

      this.scene.add(sphere);
    });


    this.render();
    this.animate();


  }

  /*window.addEventListener("resize", function() {
   var newWidth  = window.innerWidth,
   newHeight = window.innerHeight;
   _renderer.setSize(newWidth, newHeight);
   _camera.lookAt( new THREE.Vector3( 1, 0, 0 ));
   _camera.aspect = newWidth / newHeight;
   _camera.updateProjectionMatrix();
   });*/

}


//--------------------------


export default class GraphView extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="GraphView">
        <h2>{this.props.status}</h2>
        <div className="displaysWrapper">
          <div ref="graph"/>
          <svg width="500" height="500" ref="svg"></svg>
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.orbsRender = new Orbs3D(this.refs.graph);
  }

  componentDidUpdate() {

    if (!this.props.status === 'done') {
      return;
    }

    let svg = d3.select(this.refs.svg),
      diameter = +svg.attr("width"),
      g = svg.append("g"),
      format = d3.format(",d");

    let pack = d3.pack()
      .size([diameter, diameter]);

    let root = d3.hierarchy(this.props.items)
      .sum(function (d) {
        return d.size;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      });

    const descendants = pack(root).descendants();

    this.orbsRender.load(descendants);

    const node = g.selectAll(".node")
      .data(descendants)
      .enter().append("g")
      .attr("id", function (d) {
        return safeClassName(d.data.name);
      })
      .attr("class", function (d) {
        return d.children ? "node" : "leaf node";
      })
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });


    function highlightClosestOpen(d){
      if(d.data.isExpanded || d.depth === 0){
        g.selectAll(".active").classed("active", false );
        g.selectAll("#"+safeClassName(d.data.name)).classed("active", true );
      }
      else {
        const parent = descendants.find(c=> {
          return c.children && c.children.indexOf(root) >= 0
        });
        if(parent){
          this.highlightClosestOpen(parent);
        }
      }
    }

    node.append("circle")
      .attr("r", function (d) {
        return d.r;
      })
      .on("click", d => {
        this.orbsRender.openByName(d.data.name);
        d3.event.stopPropagation();
      })
      .on("mouseover", highlightClosestOpen); //TODO:debounce AND TOGGLE!!
    //TODO:mouse out



     node.append("text")
     .attr("dy", "0.3em")
     .text(function (d) {
     return d.data.name.substring(0, d.r / 3);
     });


  }

}
GraphView.propTypes = {
  items: React.PropTypes.object.isRequired,
  status: React.PropTypes.string.isRequired,
  apiGet: React.PropTypes.func.isRequired,
}
