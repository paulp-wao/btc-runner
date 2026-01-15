import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class GraphEntity extends Entity {
  private readonly graphics: PIXI.Graphics;
  private readonly dotGraphics: PIXI.Graphics;
  private readonly lineToPlayerGraphics: PIXI.Graphics;
  private readonly valueText: PIXI.Text;
  private readonly color: number;
  private readonly lineWidth: number;
  private dataPoints: number[] = [];
  private ticks: number;
  private pointSpacing: number;
  private framesPerPoint: number;
  private lastValidY: number | null = null;
  private moonValue: number = 0;

  // Graph falling configuration
  private fallSpeed: number = 0.5; // How fast the graph falls (pixels per frame)
  private fallStartDistance: number = 60; // Screen X position where falling starts (points left of this fall)
  private fallAcceleration: number = 0.02; // How much faster points fall the further left they are
  private fallingOffsets: number[] = []; // Track falling offset for each point

  constructor(props: {
    width: number;
    height: number;
    maxPoints?: number;
    color?: number;
    lineWidth?: number;
    pointSpacing?: number;
    framesPerPoint?: number;
  }) {
    const {
      width: _width,
      height: _height,
      maxPoints: _maxPoints = 100,
      color = 0xf7931a,
      lineWidth = 2,
      pointSpacing = 3,
      framesPerPoint = 3,
    } = props;
    const graphics = new PIXI.Graphics();
    const dotGraphics = new PIXI.Graphics();
    const lineToPlayerGraphics = new PIXI.Graphics();
    const valueText = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0x00ff00, // Green color
        align: 'center',
      },
    });
    valueText.anchor.set(0.5, 1); // Center horizontally, anchor at bottom
    valueText.resolution = 3;
    const container = new PIXI.Container();
    container.addChild(graphics);
    container.addChild(lineToPlayerGraphics);
    container.addChild(dotGraphics);
    container.addChild(valueText);

    // Set z-index for internal elements so they render above the graph line
    graphics.zIndex = 0;
    lineToPlayerGraphics.zIndex = 1;
    dotGraphics.zIndex = 10;
    valueText.zIndex = 20;
    container.sortableChildren = true;

    super(container);

    this.graphics = graphics;
    this.dotGraphics = dotGraphics;
    this.lineToPlayerGraphics = lineToPlayerGraphics;
    this.valueText = valueText;
    this.color = color;
    this.lineWidth = lineWidth;
    this.pointSpacing = pointSpacing;
    this.framesPerPoint = framesPerPoint;
    this.ticks = 0;

    // Initialize dot (hidden initially) - Bitcoin orange color
    this.dotGraphics.circle(0, 0, 6);
    this.dotGraphics.fill({ color: 0xf7931a });
    this.dotGraphics.visible = false;
    this.valueText.visible = false;

    // Pre-populate the graph with initial data points
    this.initializeDataPoints();
  }

  private initializeDataPoints(): void {
    // Initialize falling offsets array (all zeros initially)
    this.fallingOffsets = [];

    const predeterminedPoints = [
      0, -36, -15, -30, -18, -28, -20, -27, -22, -29, -25, -33, -28, -33, -29, -34, -29, -33, -30, -33, -32, -37, -34,
      -37, -34, -37, -34, -37, -34, -37, -35, -41, -41, -49, -49, -55, -56, -61, -60, -65, -64, -71, -74, -78, -81, -86,
      -85, -88, -88, -89, -88, -89, -87, -90, -87, -90, -87, -91, -90, -91, -90, -92, -89, -94, -96, -97, -96, -97, -98,
      -101, -99, -100, -101, -103, -104, -107, -108, -112, -117, -127, -127, -133, -133, -138, -138, -143, -140, -146,
      -139, -163, -175, -175, -178, -179, -179, -180, -182, -184, -186, -189, -189, -191, -192, -195, -196, -197, -197,
      -199, -200, -202, -202, -204, -205, -209, -210, -211, -214, -227, -231, -239, -242, -245, -245, -246, -246, -247,
      -246, -248, -249, -251, -252, -253, -252, -256, -256, -260, -262, -265, -264, -265, -264, -265, -264, -265, -262,
      -259, -255, -255, -253, -253, -250, -249, -244, -241, -239, -238, -234, -226, -218, -205, -192, -189, -184, -184,
      -182, -180, -177, -178, -177, -177, -173, -173, -170, -170, -168, -168, -167, -166, -165, -164, -163, -160, -158,
      -157, -156, -155, -154, -155, -154, -155, -154, -155, -155, -157, -157, -159, -158, -159, -158, -159, -158, -159,
      -158, -159, -158, -159, -157, -161, -163, -166, -167, -168, -170, -173, -173, -176, -177, -179, -179, -182, -186,
      -188, -191, -197, -198, -199, -200, -203, -205, -206, -207, -210, -210, -211, -210, -211, -212, -215, -216, -217,
      -217, -218, -217, -218, -219, -224, -225, -228, -229, -230, -229, -230, -229, -230, -229, -230, -229, -229, -227,
      -228, -226, -227, -226, -228, -229, -230, -229, -230, -229, -230, -231, -232, -235, -236, -237, -238, -239, -240,
      -241, -247, -249, -260, -262, -267, -270, -273, -273, -274, -273, -274, -273, -274, -273, -274, -273, -274, -273,
      -274, -273, -274, -272, -270, -267, -267, -265, -266, -265, -266, -265, -265, -262, -263, -261, -260, -257, -257,
      -254, -254, -252, -252, -250, -249, -246, -246, -245, -245, -243, -244, -245, -246, -245, -248, -249, -251, -252,
      -253, -252, -256, -257, -258, -257, -260, -260, -261, -261, -264, -266, -270, -271, -274, -275, -278, -279, -282,
      -283, -286, -289, -292, -293, -294, -295, -298, -299, -303, -303, -309, -313, -314, -323, -329, -335, -345, -345,
      -348, -349, -351, -350, -352, -353, -357, -358, -360, -361, -365, -366, -368, -367, -369, -369, -371, -371, -373,
      -377, -383, -384, -387, -387, -388, -391, -394, -402, -409, -413, -421, -423, -426, -426, -430, -431, -433, -433,
      -434, -433, -434, -435, -436, -435, -436, -435, -436, -435, -436, -435, -436, -435, -436, -434, -434, -431, -429,
      -426, -425, -421, -419, -418, -416, -414, -414, -413, -413, -410, -411, -410, -411, -410, -410, -406, -407, -405,
      -406, -405, -406, -405, -406, -406, -413, -415, -419, -422, -427, -429, -432, -434, -438, -442, -445, -446, -449,
      -451, -455, -459, -462, -465, -468, -473, -475, -479, -487, -487, -496, -497, -500, -502, -506, -508, -512, -515,
      -519, -519, -520, -520, -521, -522, -525, -524, -526, -526, -527, -529, -530, -529, -532, -531, -533, -535, -536,
      -535, -536, -536, -538, -537, -538, -537, -538, -538, -540, -541, -544, -545, -549, -550, -552, -555, -558, -561,
      -562, -564, -565, -566, -569, -571, -572, -574, -577, -576, -580, -580, -581, -582, -585, -585, -586, -586, -587,
      -588, -591, -590, -591, -590, -591, -591, -594, -593, -594, -595, -596, -595, -597, -599, -600, -599, -600, -599,
      -600, -599, -600, -596, -596, -594, -593, -591, -586, -585, -585, -583, -583, -581, -581, -580, -581, -580, -581,
      -580, -581, -580, -581, -580, -581, -580, -581, -580, -581, -580, -581, -580, -581, -580, -581, -580, -581, -580,
      -581, -580, -581, -580, -581, -580, -581, -584, -586, -590, -593, -593, -597, -598, -601, -602, -603, -602, -603,
      -603, -605, -604, -605, -604, -605, -604, -605, -604, -605, -604, -605, -604, -605, -604, -605, -604, -605, -604,
      -608, -608, -608, -608, -610, -611, -613, -613, -616, -616, -618, -618, -619, -620, -621, -622, -625, -627, -628,
      -627, -628, -627, -628, -627, -628, -627, -628, -627, -628, -627, -628, -627, -628, -627, -628, -627, -628, -627,
      -628, -627, -628, -627, -628, -627, -628, -627, -628, -627, -628, -627, -629, -633, -636, -638, -640, -641, -645,
      -646, -649, -649, -651, -652, -656, -658, -660, -661, -662, -665, -666, -667, -668, -667, -668, -667, -670, -670,
      -672, -673, -676, -678, -679, -682, -684, -686, -688, -690, -692, -695, -697, -699, -702, -705, -707, -709, -712,
      -715, -717, -719, -728, -742, -764, -768, -774, -778, -781, -785, -789, -790, -793, -793, -796, -798, -800, -802,
      -805, -807, -809, -808, -811, -811, -813, -812, -815, -814, -817, -819, -820, -820, -823, -825, -827, -828, -830,
      -830, -832, -831, -832, -833, -834, -836, -837, -836, -837, -836, -837, -836, -837, -836, -836, -835, -836, -835,
      -835, -833, -834, -833, -832, -831, -830, -829, -830, -829, -830, -829, -830, -826, -826, -823, -823, -814, -814,
      -806, -793, -793, -790, -789, -786, -784, -784, -782, -782, -781, -782, -782, -783, -782, -782, -784, -786, -788,
      -792, -794, -797, -798, -802, -804, -808, -809, -811, -813, -816, -818, -822, -825, -829, -837, -836, -845, -849,
      -854, -855, -860, -867, -868, -874, -881, -885, -891, -893, -894, -896, -895, -897, -898, -904, -905, -908, -908,
      -909, -908, -909, -908, -908, -905, -905, -902, -903, -902, -903, -902, -906, -908, -911, -913, -913, -915, -914,
      -915, -914, -915, -914, -915, -913, -913, -909, -906, -905, -905, -904, -902, -900, -897, -897, -895, -899, -901,
      -906, -908, -913, -919, -921, -921, -925, -930, -932, -945, -946, -947, -949, -950, -949, -950, -949, -950, -949,
      -950, -949, -950, -948, -947, -946, -944, -944, -941, -941, -940, -941, -940, -942, -943, -942, -945, -946, -947,
      -949, -951, -952, -953, -956, -957, -959, -959, -961, -963, -964, -966, -966, -968, -969, -974, -976, -978, -978,
      -978, -978, -978, -978, -978, -978, -978, -977, -977, -975, -973, -970, -971, -970, -971, -970, -971, -970, -972,
      -969, -972, -969,
    ];
    for (let i = 0; i < predeterminedPoints.length; i++) {
      this.dataPoints.push(predeterminedPoints[i]);
      this.fallingOffsets.push(0); // Initialize falling offset for each point
    }

    // Draw the initial graph
    this.redraw();
  }

  public updateCurve(newValue: number): void {
    const lastValue = this.dataPoints[this.dataPoints.length - 1];
    const newAbsoluteValue = lastValue + newValue;
    this.dataPoints.push(newAbsoluteValue);

    // // Keep only the last maxPoints values
    // if (this.dataPoints.length > this.maxPoints) {
    //   this.dataPoints.shift();
    // }

    // this.redraw();
  }

  public updateScroll(_delta: number, speedMultiplier: number = 1): void {
    if (this.dataPoints.length < 2) return;

    this.ticks += speedMultiplier;

    // Update falling effect for points behind the player
    this.updateFalling();

    // Redraw to show the updated scroll position
    this.redraw();
  }

  /**
   * Updates the falling offset for all graph points.
   * The graph constantly falls, but scrolling forward "outruns" the falling.
   * If the player stops or slows down, the ground falls out from under them.
   */
  private updateFalling(): void {
    // All points fall at the base speed, plus acceleration based on how far left they are
    for (let i = 0; i < this.fallingOffsets.length; i++) {
      // Calculate the screen X position of this point
      const pointScreenX = i * this.pointSpacing - this.ticks;

      // Points to the left of the fall start distance fall
      // The further left, the faster they fall
      if (pointScreenX < this.fallStartDistance) {
        const distanceBehind = this.fallStartDistance - pointScreenX;
        const acceleratedFallSpeed = this.fallSpeed + (distanceBehind * this.fallAcceleration);
        this.fallingOffsets[i] += acceleratedFallSpeed;
      }
    }
  }

  public redraw(): void {
    this.graphics.clear();

    if (this.dataPoints.length < 2) {
      return;
    }

    // Draw the curve line with scroll offset and falling offset applied
    // Start from the first point, offset by scroll amount
    const startX = -this.ticks;
    const startY = this.dataPoints[0] + (this.fallingOffsets[0] || 0);
    this.graphics.moveTo(startX, startY);

    for (let i = 1; i < this.dataPoints.length; i++) {
      const x = i * this.pointSpacing - this.ticks;
      const y = this.dataPoints[i] + (this.fallingOffsets[i] || 0); // Apply falling offset
      this.graphics.lineTo(x, y);
    }

    this.graphics.stroke({ color: this.color, width: this.lineWidth });
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }

  private getOffset(): number {
    return this.ticks * (this.pointSpacing / this.framesPerPoint);
  }

  /**
   * Returns the y value of the graph at the given x coordinate.
   * Uses linear interpolation between data points.
   * @param x The x coordinate in the graph's coordinate system
   * @returns The corresponding y value, or null if x is outside the graph bounds
   */
  /**
   * Returns the position of the graph's end point in world coordinates.
   * @returns The x and y coordinates of the last data point
   */
  public getEndPoint(): { x: number; y: number } {
    const lastIndex = this.dataPoints.length - 1;
    const x = lastIndex * this.pointSpacing - this.ticks;
    const y = this.dataPoints[lastIndex];
    return { x, y };
  }

  public getYAtX(x: number): number | null {
    if (this.dataPoints.length === 0) {
      return null;
    }

    // Convert x coordinate to point index accounting for scroll offset
    // x = i * pointSpacing - ticks
    // i = (x + ticks) / pointSpacing
    const pointIndex = (x + this.getOffset()) / this.pointSpacing;

    // Handle boundary cases
    if (pointIndex < 0) {
      // x is before the first point, return first point's y value with falling offset
      return this.dataPoints[0] + (this.fallingOffsets[0] || 0);
    }

    if (pointIndex >= this.dataPoints.length - 1) {
      // x is at or after the last point, return last point's y value
      return 0;
    }

    // Linear interpolation between two points
    const lowerIndex = Math.floor(pointIndex);
    const upperIndex = Math.ceil(pointIndex);
    const t = pointIndex - lowerIndex; // interpolation factor (0 to 1)

    // Get base y values with falling offsets applied
    const y1 = this.dataPoints[lowerIndex] + (this.fallingOffsets[lowerIndex] || 0);
    const y2 = this.dataPoints[upperIndex] + (this.fallingOffsets[upperIndex] || 0);

    return y1 + (y2 - y1) * t;
  }

  /**
   * Returns the slope (dy/dx) of the graph at the given x coordinate.
   * Uses the difference between adjacent points to calculate slope.
   * @param x The x coordinate in the graph's coordinate system
   * @returns The slope value, or null if x is outside the graph bounds
   */
  public getSlopeAtX(x: number): number | null {
    if (this.dataPoints.length < 2) {
      return null;
    }

    // Convert x coordinate to point index accounting for scroll offset
    const pointIndex = (x + this.getOffset()) / this.pointSpacing;

    // Handle boundary cases
    if (pointIndex < 0 || pointIndex >= this.dataPoints.length - 1) {
      return null;
    }

    // Get the indices of the two points we're between
    const lowerIndex = Math.floor(pointIndex);
    const upperIndex = Math.ceil(pointIndex);

    // If we're exactly on a point, use the next point for slope calculation
    // Otherwise, use the two points we're between
    let index1: number;
    let index2: number;

    if (lowerIndex === upperIndex) {
      // Exactly on a point, use this point and the next
      index1 = lowerIndex;
      index2 = Math.min(lowerIndex + 1, this.dataPoints.length - 1);
    } else {
      // Between two points, use those points
      index1 = lowerIndex;
      index2 = upperIndex;
    }

    // Calculate slope: dy/dx
    const y1 = this.dataPoints[index1];
    const y2 = this.dataPoints[index2];
    const dx = (index2 - index1) * this.pointSpacing;
    const dy = y2 - y1;

    // Return the slope (dy/dx)
    return dx !== 0 ? dy / dx : 0;
  }

  /**
   * Updates the position of the black dot on the graph based on the character's position.
   * @param worldX The x coordinate of the character in world coordinates
   * @param worldY The y coordinate of the character in world coordinates
   */
  public updateDotPosition(worldX: number, worldY: number): void {
    // Convert world X to graph's local X coordinate
    const localX = worldX - this.ctr.x;
    const y = this.getYAtX(localX);

    // Check if we're past the end of the graph (getYAtX returns 0 when past the end)
    const pointIndex = (localX + this.getOffset()) / this.pointSpacing;
    const isPastGraph = pointIndex >= this.dataPoints.length - 1;

    if (y !== null && !isPastGraph) {
      // We're still on the graph - show dot and update value
      this.lastValidY = y;
      this.moonValue = Math.abs(y * 2031.57);

      // Set dot position in local coordinates (relative to graph container)
      this.dotGraphics.position.set(localX, y);
      this.dotGraphics.visible = true;

      // Position text above the character (convert world Y to local)
      const localY = worldY - this.ctr.y;

      // Draw dotted line from orange dot to player center (offset up by ~half player height)
      const playerCenterY = localY - 20;
      this.lineToPlayerGraphics.clear();
      const dashLength = 4;
      const gapLength = 4;
      const startY = Math.min(y, playerCenterY);
      const endY = Math.max(y, playerCenterY);
      let currentY = startY;
      while (currentY < endY) {
        const dashEnd = Math.min(currentY + dashLength, endY);
        this.lineToPlayerGraphics.moveTo(localX, currentY);
        this.lineToPlayerGraphics.lineTo(localX, dashEnd);
        currentY = dashEnd + gapLength;
      }
      this.lineToPlayerGraphics.stroke({ color: 0xcccccc, width: 2, alpha: 0.5 });
      this.lineToPlayerGraphics.visible = true;

      // Calculate and display the value: |Y * 2031.57|
      const value = this.moonValue;
      // Format the value with commas and 2 decimal places
      const formattedValue = `+$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      this.valueText.text = formattedValue;
      this.valueText.position.set(localX, localY - 40);
      this.valueText.visible = true;
    } else {
      // We're past the graph (on the moon) - hide dot and line, keep text following character
      this.dotGraphics.visible = false;
      this.lineToPlayerGraphics.visible = false;

      // Keep incrementing the value
      if (this.moonValue > 0) {
        this.moonValue += 2031.57;
      } else if (this.lastValidY !== null) {
        // Initialize from last valid position if we have one
        this.moonValue = Math.abs(this.lastValidY * 2031.57) + 2031.57;
      } else {
        this.moonValue = 2031.57;
      }

      // Format the value with commas and 2 decimal places
      const formattedValue = `+$${this.moonValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      this.valueText.text = formattedValue;

      // Position text above the character (convert world coordinates to local)
      const localY = worldY - this.ctr.y;
      this.valueText.position.set(localX, localY - 40);
      this.valueText.visible = true;
    }
  }

  public reset(): void {
    this.ticks = 0;
    // Reset all falling offsets to zero
    for (let i = 0; i < this.fallingOffsets.length; i++) {
      this.fallingOffsets[i] = 0;
    }
    this.redraw();
  }

  // Getters and setters for falling configuration
  public getFallSpeed(): number {
    return this.fallSpeed;
  }

  public setFallSpeed(speed: number): void {
    this.fallSpeed = speed;
  }

  public getFallStartDistance(): number {
    return this.fallStartDistance;
  }

  public setFallStartDistance(distance: number): void {
    this.fallStartDistance = distance;
  }

  public getFallAcceleration(): number {
    return this.fallAcceleration;
  }

  public setFallAcceleration(acceleration: number): void {
    this.fallAcceleration = acceleration;
  }

  /**
   * Returns the falling offset at a given x coordinate.
   * Used to determine if the graph has fallen away at the player's position.
   * @param x The x coordinate in the graph's coordinate system
   * @returns The falling offset, or 0 if x is outside bounds
   */
  public getFallingOffsetAtX(x: number): number {
    if (this.dataPoints.length === 0) {
      return 0;
    }

    // Convert x coordinate to point index accounting for scroll offset
    const pointIndex = (x + this.getOffset()) / this.pointSpacing;

    // Handle boundary cases
    if (pointIndex < 0) {
      return this.fallingOffsets[0] || 0;
    }

    if (pointIndex >= this.dataPoints.length - 1) {
      return 0;
    }

    // Linear interpolation between two points' falling offsets
    const lowerIndex = Math.floor(pointIndex);
    const upperIndex = Math.ceil(pointIndex);
    const t = pointIndex - lowerIndex;

    const offset1 = this.fallingOffsets[lowerIndex] || 0;
    const offset2 = this.fallingOffsets[upperIndex] || 0;

    return offset1 + (offset2 - offset1) * t;
  }
}
