export default
`#version 300 es
precision highp float;

in vec4 vColor;
out vec4 minhaColor;

void main()
{
  float dist  = length(gl_PointCoord.xy - vec2(.5, .5));

  if(dist > 0.5) {
    discard;
  }

  minhaColor = vec4(vColor.rgb, vColor.a);
}`


