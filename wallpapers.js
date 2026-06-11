/* The Healing Lounge — interactive shader wallpapers
   Palette ("stille luxe"):
     espresso  #261A11   warm dark base
     cocoa     #4D3017
     honey     #D18C3D
     gold      #EBC985
     linen     #F2EBDB
     moss      #43592B / deep green for rust
     deepgreen #1A2B20
     roodlicht #B85742   warm red (rode licht therapie)
*/

const HL_PRELUDE = `
precision highp float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;        // eased, centered & /height, y-up
uniform float u_mouseActive;  // 0..1 recency of movement
uniform vec4  u_clicks[10];    // xy pos, z age(sec), w unused
uniform int   u_clickCount;

const vec3 espresso  = vec3(0.149,0.102,0.066);
const vec3 cocoa     = vec3(0.302,0.188,0.094);
const vec3 honey     = vec3(0.820,0.549,0.239);
const vec3 gold      = vec3(0.922,0.788,0.522);
const vec3 linen     = vec3(0.949,0.922,0.859);
const vec3 moss      = vec3(0.263,0.349,0.169);
const vec3 deepgreen = vec3(0.102,0.169,0.125);
const vec3 roodlicht = vec3(0.722,0.341,0.259);

float hash21(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash21(i), b=hash21(i+vec2(1.,0.)), c=hash21(i+vec2(0.,1.)), d=hash21(i+vec2(1.,1.));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<6;i++){ s+=a*vnoise(p); p=p*2.02+vec2(1.7,9.2); a*=.5; } return s; }
`;

/* 0 — Vloeibare Honing : thick, glossy, light-glinting real honey */
const FRAG_HONEY_REAL = `
// viscous domain-warped height field — the "body" of the honey
float honeyH(vec2 uv){
  float t = u_time*0.045;
  vec2 p = uv*1.2;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(4.3, -t*0.8)));
  vec2 r = vec2(fbm(p + 1.7*q + vec2(1.7,9.2) + 0.10*t),
                fbm(p + 1.7*q + vec2(8.3,2.8) - 0.08*t));
  float md = length(uv - u_mouse);
  r += 0.16*normalize(uv - u_mouse + 1e-4)*exp(-md*1.5);
  float h = fbm(p + 2.0*r);
  for(int i=0;i<10;i++){ if(i>=u_clickCount) break;
    vec4 c=u_clicks[i]; float d=length(uv-c.xy);
    h += 0.05*sin(d*15.0 - c.z*5.0)*exp(-d*2.4)*exp(-c.z*1.1);
  }
  return h;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;

  // surface normal from the height field -> glossy lighting
  float e = 0.0032;
  float h  = honeyH(uv);
  float hx = honeyH(uv+vec2(e,0.0)) - h;
  float hy = honeyH(uv+vec2(0.0,e)) - h;
  vec3 n = normalize(vec3(-hx, -hy, 2.0*e*5.5));

  vec3 L  = normalize(vec3(0.32, 0.5, 0.78));   // key light
  vec3 L2 = normalize(vec3(-0.55,-0.28,0.62));  // rim glint
  float dif   = clamp(dot(n,L),0.0,1.0);
  float spec  = pow(clamp(dot(reflect(-L , n), vec3(0.0,0.0,1.0)),0.0,1.0), 42.0);
  float glint = pow(clamp(dot(reflect(-L2, n), vec3(0.0,0.0,1.0)),0.0,1.0), 110.0);

  // amber depth ramp — thin honey is dark amber, thick honey glows gold
  float f = clamp(h*1.08, 0.0, 1.0);
  vec3 deepAmber = vec3(0.34,0.15,0.03);
  vec3 amber     = vec3(0.60,0.31,0.07);
  vec3 col = mix(espresso, deepAmber, smoothstep(0.00,0.40,f));
  col = mix(col, amber,    smoothstep(0.30,0.62,f));
  col = mix(col, honey,    smoothstep(0.55,0.84,f));
  col = mix(col, gold,     smoothstep(0.80,1.00,f));

  col *= 0.68 + 0.52*dif;                         // viscous body shading
  col += honey*0.14*smoothstep(0.42,1.0,f);       // translucent inner glow
  col += gold*spec*1.15;                          // glossy sheen
  col += vec3(1.0,0.96,0.86)*glint*0.95;          // sharp light glints
  float md = length(uv-u_mouse);
  col += gold*0.30*exp(-md*2.2)*u_mouseActive;    // warm pull under cursor
  col *= 1.0 - 0.30*dot(uv,uv);                   // vignette
  gl_FragColor = vec4(col,1.0);
}
`;

/* 1 — Honingstroom : domain-warped flowing honey */
const FRAG_HONEY = `
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
  float t = u_time*0.06;
  vec2 p = uv*1.4;
  vec2 m = u_mouse;
  vec2 q = vec2(fbm(p + vec2(0.0,t)), fbm(p + vec2(5.2,-t)));
  vec2 r = vec2(fbm(p + 1.6*q + vec2(1.7,9.2) + 0.15*t),
                fbm(p + 1.6*q + vec2(8.3,2.8) - 0.12*t));
  float md = length(uv - m);
  r += 0.22*normalize(uv - m + 1e-4)*exp(-md*1.6);
  float f = fbm(p + 1.9*r);
  for(int i=0;i<10;i++){ if(i>=u_clickCount) break;
    vec4 c=u_clicks[i]; float d=length(uv-c.xy);
    f += 0.09*sin(d*15.0 - c.z*6.0)*exp(-d*2.6)*exp(-c.z*1.2);
  }
  f = clamp(f*1.12,0.0,1.0);
  vec3 col = mix(espresso, cocoa, smoothstep(0.0,0.42,f));
  col = mix(col, honey, smoothstep(0.36,0.72,f));
  col = mix(col, gold,  smoothstep(0.66,0.97,f));
  col += gold*0.35*exp(-md*2.3)*u_mouseActive;
  col *= 1.0 - 0.34*dot(uv,uv);
  gl_FragColor = vec4(col,1.0);
}
`;

/* 2 — Aurora : green-gold curtains over a warm night */
const FRAG_AURORA = `
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
  float t = u_time*0.10;
  vec3 col = mix(vec3(0.055,0.082,0.069), deepgreen, smoothstep(-0.7,0.7,uv.y));
  col = mix(col, espresso*0.85, smoothstep(0.2,1.05,uv.y));
  float st = hash21(floor((uv+5.0)*120.0));
  col += step(0.9965,st)*0.55*linen*(0.5+0.5*sin(t*8.0+st*40.0));
  float mfoc = 0.5 + 0.65*exp(-pow((uv.x-u_mouse.x)*1.0,2.0))*(0.4+0.6*u_mouseActive);
  for(int i=0;i<4;i++){
    float fi=float(i);
    float wave = fbm(vec2(uv.x*1.1 + fi*1.7 + t*(0.7+0.1*fi), t*0.4+fi))*1.1 - 0.55 + 0.12*fi;
    float d = uv.y - wave;
    float band = exp(-d*d*7.0);
    float curt = 0.55+0.45*fbm(vec2(uv.x*7.0+fi*4.0, uv.y*1.5 - t*3.0 - fi));
    float a = band*curt*mfoc*(0.72-0.13*fi);
    vec3 ac = mix(moss*1.5, gold, smoothstep(0.0,0.9,uv.y - wave + 0.5));
    ac = mix(ac, honey, 0.28*fi);
    col += ac*a;
  }
  for(int i=0;i<10;i++){ if(i>=u_clickCount) break;
    vec4 c=u_clicks[i]; float dx=uv.x-c.xy.x;
    float bloom=exp(-dx*dx*30.0)*exp(-c.z*1.1)*(1.0-smoothstep(0.0,1.4,c.z));
    col += gold*bloom*1.3*smoothstep(-0.5,0.6,uv.y);
  }
  col *= 1.0 - 0.30*dot(uv,uv);
  gl_FragColor = vec4(col,1.0);
}
`;

/* 3 — Zijden Licht : silk caustics, linen & gold */
const FRAG_CAUSTICS = `
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
  float t = u_time*0.08;
  vec2 p = uv*2.2 + 0.30*u_mouse;
  float c=0.0; vec2 q=p;
  for(int i=0;i<3;i++){
    float fi=float(i)+1.0;
    vec2 w = vec2(fbm(q+vec2(t,0.0)+fi), fbm(q+vec2(0.0,-t)+fi*2.0));
    q = p + 1.5*w;
    float n = fbm(q*1.5 + t*0.5);
    c += pow(1.0-abs(sin(n*6.2831 + t)),3.0);
  }
  c/=3.0;
  for(int i=0;i<10;i++){ if(i>=u_clickCount) break;
    vec4 cl=u_clicks[i]; float d=length(uv-cl.xy);
    c += 0.4*sin(d*20.0-cl.z*7.0)*exp(-d*3.0)*exp(-cl.z*1.3);
  }
  c=clamp(c,0.0,1.0);
  vec3 base = mix(espresso, cocoa, 0.5);
  vec3 col = mix(base*0.92, linen, smoothstep(0.2,0.95,c));
  col = mix(col, gold, smoothstep(0.62,1.0,c)*0.7);
  col += honey*0.22*exp(-length(uv-u_mouse)*2.1)*u_mouseActive;
  col *= 1.0 - 0.30*dot(uv,uv);
  gl_FragColor = vec4(col,1.0);
}
`;

/* 4 — Sintels : drifting glowing metaballs */
const FRAG_EMBERS = `
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
  float t = u_time*0.25;
  float field=0.0; vec3 acc=vec3(0.0);
  for(int i=0;i<6;i++){
    float fi=float(i);
    vec2 c=vec2(sin(t*0.6+fi*1.7)*0.8*cos(fi) + 0.3*sin(t*0.3+fi),
                cos(t*0.5+fi*2.3)*0.5 + 0.15*sin(t+fi));
    float r=0.16+0.05*sin(fi*2.0);
    float d=length(uv-c);
    float g=r*r/(d*d+0.001);
    field+=g;
    vec3 oc = mix(honey, gold, fract(fi*0.37));
    oc = mix(oc, roodlicht, step(4.5,fi)*0.6);
    acc += oc*g;
  }
  float dm=length(uv-u_mouse);
  float gm=(0.045+0.04*u_mouseActive)/(dm*dm+0.002);
  field+=gm; acc+=gold*gm*1.2;
  for(int i=0;i<10;i++){ if(i>=u_clickCount) break;
    vec4 cl=u_clicks[i];
    vec2 pos=cl.xy + vec2(0.05*sin(cl.z*3.0), cl.z*0.35);
    float d=length(uv-pos);
    float g=0.02/(d*d+0.001)*exp(-cl.z*0.9);
    field+=g; acc+=roodlicht*g*1.4;
  }
  vec3 col = espresso*0.7;
  vec3 ec = acc/max(field,0.001);
  col = mix(col, ec, smoothstep(0.6,1.6,field));
  col += ec*smoothstep(1.0,2.6,field)*0.6;
  col *= 1.0 - 0.24*dot(uv,uv);
  gl_FragColor = vec4(col,1.0);
}
`;

/* 5 — Stille Vijver : meditative water ripples with lit normals */
const FRAG_POOL = `
float surf(vec2 uv){
  float t=u_time;
  float dm=length(uv-u_mouse);
  float h=0.45*sin(dm*16.0 - t*2.0)*exp(-dm*2.0)*u_mouseActive;
  h += 0.04*sin(length(uv)*7.0 - t*0.7);
  for(int i=0;i<10;i++){ if(i>=u_clickCount) break;
    vec4 cl=u_clicks[i]; float d=length(uv-cl.xy);
    h += sin(d*22.0 - cl.z*7.0)*exp(-d*2.0)*exp(-cl.z*0.8)/(1.0+cl.z*1.2);
  }
  return h;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
  float e=0.004;
  float h=surf(uv);
  float hx=surf(uv+vec2(e,0.0))-surf(uv-vec2(e,0.0));
  float hy=surf(uv+vec2(0.0,e))-surf(uv-vec2(0.0,e));
  vec3 n=normalize(vec3(-hx,-hy,2.0*e*8.0));
  vec3 L=normalize(vec3(0.4,0.6,0.8));
  float dif=clamp(dot(n,L),0.0,1.0);
  float spec=pow(clamp(dot(reflect(-L,n),vec3(0.0,0.0,1.0)),0.0,1.0),24.0);
  vec3 deep=mix(espresso*0.85, deepgreen*0.95, 0.5);
  vec3 col=deep*(0.82+0.42*dif);
  col += gold*spec*1.05;
  col += gold*0.055*smoothstep(-0.25,0.95,uv.y);   // soft reflected sheen
  col += honey*0.035;                               // warm ambient
  col = mix(col, gold, smoothstep(0.2,0.8,h)*0.28);
  col += honey*0.12*exp(-length(uv-u_mouse)*3.0)*u_mouseActive;
  col *= 1.0 - 0.35*dot(uv,uv);
  gl_FragColor = vec4(col,1.0);
}
`;

window.HL_WALLPAPERS = [
  { id:'honeyreal', name:'Vloeibare Honing', en:'Liquid Honey', frag:FRAG_HONEY_REAL,
    swatch:'linear-gradient(135deg,#241910,#B0732A 55%,#EBC985)' },
  { id:'honey',  name:'Honingstroom', en:'Honey Flow',  frag:FRAG_HONEY,
    swatch:'linear-gradient(135deg,#261A11,#D18C3D 60%,#EBC985)' },
  { id:'aurora', name:'Aurora',       en:'Aurora',      frag:FRAG_AURORA,
    swatch:'linear-gradient(160deg,#101A10,#43592B 55%,#EBC985)' },
  { id:'silk',   name:'Zijden Licht', en:'Silk Light',  frag:FRAG_CAUSTICS,
    swatch:'linear-gradient(135deg,#3A2614,#F2EBDB 65%,#EBC985)' },
  { id:'ember',  name:'Sintels',      en:'Embers',      frag:FRAG_EMBERS,
    swatch:'radial-gradient(circle at 35% 35%,#EBC985,#D18C3D 40%,#B85742 70%,#1A120B)' },
  { id:'pool',   name:'Stille Vijver',en:'Still Pool',  frag:FRAG_POOL,
    swatch:'linear-gradient(150deg,#13201A,#3A4A38 60%,#EBC985)' },
];
window.HL_PRELUDE = HL_PRELUDE;
