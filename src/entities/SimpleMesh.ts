import { Container, Mesh, MeshGeometry, Shader, UniformGroup } from 'pixi.js';
import { Entity } from '~/ecs/entity';

export class SimpleMeshEntity extends Entity {
  private time = 0;
  private uniformGroup: UniformGroup;

  constructor(x: number, y: number) {
    const size = 300;
    const geometry = new MeshGeometry({
      positions: new Float32Array([0, 0, size, 0, size, size, 0, size]),
      uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    });

    const uniformGroup = new UniformGroup({
      uTime: { value: 0, type: 'f32' },
    });

    const shader = Shader.from({
      gl: {
        vertex: `#version 300 es
          in vec2 aPosition;
          in vec2 aUV;
          out vec2 vUV;

          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform mat3 uTransformMatrix;

          void main() {
            mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
            vec3 clip = mvp * vec3(aPosition, 1.0);
            gl_Position = vec4(clip.xy, 0.0, 1.0);
            vUV = aUV;
          }
        `,
        fragment: `#version 300 es
          precision highp float;

          in vec2 vUV;
          out vec4 fragColor;

          uniform float uTime;

          #define PI 3.14159265359
          #define NUM_PARTICLES 80.0
          #define NUM_RINGS 3.0

          // Random functions
          float hash(float n) {
            return fract(sin(n) * 43758.5453123);
          }

          float hash2(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          // Spark/particle function
          float spark(vec2 uv, vec2 pos, float size) {
            float d = length(uv - pos);
            return size / (d * d + 0.001);
          }

          // Star burst shape
          float starBurst(vec2 uv, vec2 center, float time) {
            vec2 delta = uv - center;
            float angle = atan(delta.y, delta.x);
            float dist = length(delta);

            float rays = sin(angle * 8.0 + time * 2.0) * 0.5 + 0.5;
            float glow = 0.02 / (dist + 0.01);

            return glow * (0.5 + rays * 0.5);
          }

          // HSV to RGB conversion
          vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
          }

          void main() {
            vec2 uv = vUV;
            vec2 center = vec2(0.5);

            float t = uTime;
            float explosionTime = t;
            float explosionPhase = clamp(explosionTime / 2.0, 0.0, 1.0);

            vec3 totalColor = vec3(0.0);
            float totalAlpha = 0.0;

            // Base hue for this explosion
            float baseHue = 0.05;

            // Multiple rings of particles
            for (float ring = 0.0; ring < NUM_RINGS; ring++) {
              float ringDelay = ring * 0.1;
              float ringTime = max(0.0, explosionTime - ringDelay);
              float ringPhase = ringTime / (2.0 - ringDelay);

              float ringSpeed = 0.3 + ring * 0.15;
              float particleCount = NUM_PARTICLES - ring * 20.0;

              for (float i = 0.0; i < NUM_PARTICLES; i++) {
                if (i >= particleCount) break;

                // Particle angle with some randomness
                float angle = (i / particleCount) * PI * 2.0;
                angle += hash(i + ring * 100.0) * 0.3;

                // Particle velocity varies
                float speed = ringSpeed * (0.8 + hash(i * 1.3 + ring) * 0.4);

                // Gravity effect
                float gravity = 0.15 * ringTime * ringTime;

                // Particle position
                vec2 dir = vec2(cos(angle), sin(angle));
                vec2 pos = center + dir * speed * ringTime;
                pos.y += gravity; // Gravity pulls down

                // Add some wiggle
                pos += vec2(
                  sin(ringTime * 10.0 + i) * 0.01,
                  cos(ringTime * 8.0 + i * 1.5) * 0.01
                ) * ringTime;

                // Particle fades out
                float fade = 1.0 - ringPhase;
                fade = fade * fade;

                // Particle size decreases
                float size = 0.0004 * fade * (1.0 + hash(i) * 0.5);

                // Spark trail
                vec2 trailPos = pos - dir * speed * 0.05;
                float trail = spark(uv, trailPos, size * 0.3) * fade;

                // Main spark
                float s = spark(uv, pos, size) * fade;

                // Color varies per particle
                float hue = baseHue + hash(i + ring * 50.0) * 0.4;
                float sat = 0.7 + hash(i * 2.0) * 0.3;
                vec3 particleColor = hsv2rgb(vec3(hue, sat, 1.0));

                // Warm colors for trails
                vec3 trailColor = hsv2rgb(vec3(baseHue + 0.05, 0.9, 1.0));

                totalColor += particleColor * s + trailColor * trail;
                totalAlpha += s + trail * 0.5;
              }
            }

            // Central flash at start
            float flash = exp(-explosionTime * 4.0);
            float flashGlow = 0.1 / (length(uv - center) + 0.05);
            vec3 flashColor = vec3(1.0, 0.95, 0.8);
            totalColor += flashColor * flash * flashGlow;
            totalAlpha += flash * flashGlow * 0.5;

            // Star burst effect
            float burst = starBurst(uv, center, t) * exp(-explosionTime * 2.0);
            totalColor += vec3(1.0, 0.8, 0.6) * burst;
            totalAlpha += burst * 0.3;

            // Secondary mini explosions
            for (float j = 0.0; j < 5.0; j++) {
              float miniTime = explosionTime - 0.3 - j * 0.15;
              if (miniTime > 0.0 && miniTime < 0.8) {
                float miniAngle = hash(j * 7.0) * PI * 2.0;
                float miniDist = 0.15 + hash(j * 3.0) * 0.2;
                vec2 miniCenter = center + vec2(cos(miniAngle), sin(miniAngle)) * miniDist;
                miniCenter.y += 0.1 * miniTime * miniTime;

                float miniFlash = exp(-miniTime * 8.0) * 0.5;
                float miniGlow = 0.02 / (length(uv - miniCenter) + 0.02);

                vec3 miniColor = hsv2rgb(vec3(baseHue + hash(j) * 0.3, 0.8, 1.0));
                totalColor += miniColor * miniFlash * miniGlow;
                totalAlpha += miniFlash * miniGlow * 0.3;
              }
            }

            // Edge fade - soften edges of the mesh quad
            vec2 edgeDist = abs(uv - 0.5) * 2.0;
            float edgeFade = 1.0 - smoothstep(0.8, 1.0, max(edgeDist.x, edgeDist.y));

            // Apply edge fade
            totalAlpha *= edgeFade;
            totalColor *= edgeFade;

            // Tone mapping
            totalColor = 1.0 - exp(-totalColor * 1.5);
            float alpha = clamp(totalAlpha, 0.0, 1.0);

            // Discard transparent pixels
            if (alpha < 0.02) {
              discard;
            }

            // Premultiplied alpha output
            fragColor = vec4(totalColor * alpha, alpha);
          }
        `,
      },
      resources: {
        uTime: uniformGroup,
      },
    });

    const mesh = new Mesh({ geometry, shader });
    mesh.blendMode = 'normal';

    const container = new Container();
    container.addChild(mesh);
    container.x = x - size / 2;
    container.y = y - size / 2;

    super(container);
    this.uniformGroup = uniformGroup;

    // Use onRender for animation
    let time = 0;
    container.onRender = () => {
      time += 0.016;
      this.uniformGroup.uniforms.uTime = time;
    };
  }

  public update(delta: number): void {
    this.time += delta / 60;
    this.uniformGroup.uniforms.uTime = this.time;
  }
}
