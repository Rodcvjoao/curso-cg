export default
`#version 300 es
precision highp float;

in vec4 vColor;
out vec4 minhaColor;

void main()
{
  minhaColor = 0.75 * vColor;
}`


