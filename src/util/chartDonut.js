import { transition, interpolate, arc, pie, scaleOrdinal, select } from "d3";
import map from "./map";

const DEFAULT_CHART_OPTIONS = {
  // chart props
  width: 320,
  height: 320,
  padding: 12,
  // --tax orange-300 --net green-300
  colors: ["#fdba74", "#86efac"],
  innerRadius: 0.55,

  // accessors
  key: (d) => d.key,
  value: (d) => d.value,

  _strokeWidth: 2,
  _stroke: "#14532d",

  _transitionDiration: 789,
};

const chartDonut = ({ root, data, options }) => {
  const {
    width,
    height,
    padding,
    colors,
    innerRadius,
    key,
    value,
    _strokeWidth,
    _stroke,
    _transitionDiration,
  } = { ...DEFAULT_CHART_OPTIONS, ...(options || {}) };

  // coord 0
  const c = { x: width / 2, y: height / 2 };
  // take padding away
  const outerRadius = Math.min(width, height) / 2 - padding;
  // data.key-color map
  const color = scaleOrdinal(colors);
  // angles slice generator
  const piegen = pie().value(value).sort(null);
  // <path> .d attribute generator
  const arcgen = arc()
    .outerRadius(outerRadius)
    // inner radius is percent of outer
    .innerRadius(outerRadius * innerRadius);
  // interpolate angles
  const arctweenEnter = (d) => {
    const i = interpolate(d.endAngle, d.startAngle);
    return (t) => {
      d.startAngle = i(t);
      return arcgen(d);
    };
  };

  // @init
  // add elements @root
  const svg = select(root)
    .append("svg")
    // .style("border", "1px dotted gray")
    .attr("width", width)
    .attr("height", height);
  // draw * @group element
  const graph = svg
    .append("g")
    // shift coord-0 @center
    .attr("transform", `translate(${c.x},${c.y})`);

  // @render
  // bind data to paths
  const paths = graph.selectAll("path").data(piegen(data));
  const t = transition("@t1--chartDonut").duration(_transitionDiration);
  // declare domains; two colors only
  color.domain(map(data, key));
  // render paths
  // @enter-selection.d3
  paths
    .enter()
    .append("path")
    .attr("stroke", _stroke)
    .attr("stroke-width", _strokeWidth)
    .attr("fill", (d) => color(d.data.key))
    .transition(t)
    .attrTween("d", arctweenEnter);
};

export default chartDonut;
