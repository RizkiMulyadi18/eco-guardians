import * as THREE from 'three';
import { lerp } from '../utils/math.js';

export const TRASH_STATES = {
  IDLE: 'IDLE',
  HOVERED: 'HOVERED',
  DRAGGING: 'DRAGGING',
  RETURNING: 'RETURNING',
  DISPOSED: 'DISPOSED'
};

export class TrashObject {
  constructor(itemData, initialPosition = new THREE.Vector3(0, 1.2, -0.2)) {
    this.data = itemData;
    this.state = TRASH_STATES.IDLE;
    
    this.restPosition = initialPosition.clone();
    this.targetPosition = initialPosition.clone();
    
    this.mesh = this._createMesh(itemData);
    this.mesh.position.copy(this.restPosition);
    this.mesh.userData = { isTrash: true, trashInstance: this };

    this.bobTimer = Math.random() * Math.PI * 2;
  }

  _createMesh(data) {
    const group = new THREE.Group();

    // 1. Procedural 3D Mesh based on specific trash type
    let itemModel;

    switch (data.id) {
      case 'plastic_bottle':
        itemModel = this._buildPlasticBottle();
        break;
      case 'soda_can':
        itemModel = this._buildSodaCan();
        break;
      case 'snack_wrapper':
        itemModel = this._buildSnackWrapper();
        break;
      case 'crumpled_paper':
        itemModel = this._buildCrumpledPaper();
        break;
      case 'banana_peel':
        itemModel = this._buildBananaPeel();
        break;
      case 'apple_core':
        itemModel = this._buildAppleCore();
        break;
      case 'dry_leaf':
        itemModel = this._buildDryLeaf();
        break;
      case 'leftover_rice':
        itemModel = this._buildLeftoverRice();
        break;
      case 'battery':
        itemModel = this._buildBattery();
        break;
      case 'broken_bulb':
        itemModel = this._buildBrokenBulb();
        break;
      case 'chemical_bottle':
        itemModel = this._buildChemicalBottle();
        break;
      case 'electronic_pcb':
        itemModel = this._buildElectronicPCB();
        break;
      default:
        itemModel = this._buildDefaultItem(data);
        break;
    }

    group.add(itemModel);

    // 2. Floating Comic Name Tag Sprite above the object
    const nameTag = this._createNameTag(data.name);
    group.add(nameTag);

    return group;
  }

  // ==========================================
  // --- HIGH-QUALITY PROCEDURAL 3D MODELS ---
  // ==========================================

  /**
   * 1. Kulit Pisang (Banana Peel)
   * Cartoon peeled skin with 4 spreading curved peels, dark stem, and pale inner fruit core
   */
  _buildBananaPeel() {
    const group = new THREE.Group();

    // Dark brown/black stem top
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8);
    const stemMat = new THREE.MeshToonMaterial({ color: 0x3E2723 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.22;
    stem.rotation.z = 0.15;
    group.add(stem);

    // Inner pale fruit remnant
    const coreGeo = new THREE.ConeGeometry(0.10, 0.28, 8);
    const coreMat = new THREE.MeshToonMaterial({ color: 0xFFF9C4 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.08;
    group.add(core);

    // 4 Curved Peels radiating outward
    const peelMat = new THREE.MeshToonMaterial({ color: 0xFDD835, side: THREE.DoubleSide });
    const tipMat = new THREE.MeshToonMaterial({ color: 0x4E342E });

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const peelArm = new THREE.Group();

      // Curved upper peel segment
      const upperGeo = new THREE.BoxGeometry(0.12, 0.26, 0.03);
      const upper = new THREE.Mesh(upperGeo, peelMat);
      upper.position.set(0, 0.08, 0.10);
      upper.rotation.x = Math.PI / 4; // angle outwards
      peelArm.add(upper);

      // Flatted lower tip resting on floor
      const lowerGeo = new THREE.BoxGeometry(0.11, 0.20, 0.025);
      const lower = new THREE.Mesh(lowerGeo, peelMat);
      lower.position.set(0, -0.04, 0.24);
      lower.rotation.x = Math.PI / 2.3;
      peelArm.add(lower);

      // Brown spot tip
      const tipGeo = new THREE.BoxGeometry(0.09, 0.06, 0.028);
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, -0.06, 0.32);
      tip.rotation.x = Math.PI / 2.3;
      peelArm.add(tip);

      peelArm.rotation.y = angle;
      group.add(peelArm);
    }

    group.position.y = 0.02;
    return group;
  }

  /**
   * 2. Sisa Apel (Apple Core)
   * Cartoon eaten apple: red top cap, red bottom base, pale narrow core, seeds, stem & leaf
   */
  _buildAppleCore() {
    const group = new THREE.Group();

    // Red top cap
    const topCapGeo = new THREE.SphereGeometry(0.20, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const redMat = new THREE.MeshToonMaterial({ color: 0xE53935 });
    const topCap = new THREE.Mesh(topCapGeo, redMat);
    topCap.position.y = 0.12;
    group.add(topCap);

    // Red bottom base
    const btmCapGeo = new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const btmCap = new THREE.Mesh(btmCapGeo, redMat);
    btmCap.position.y = -0.12;
    group.add(btmCap);

    // Eaten pale inner core column (narrow in center)
    const coreGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.26, 12);
    const fleshMat = new THREE.MeshToonMaterial({ color: 0xFFF9C4 });
    const core = new THREE.Mesh(coreGeo, fleshMat);
    group.add(core);

    // Little black apple seeds embedded in core
    const seedMat = new THREE.MeshToonMaterial({ color: 0x212121 });
    const seedGeo = new THREE.SphereGeometry(0.022, 6, 6);
    seedGeo.scale(1, 1.8, 0.6);

    const seed1 = new THREE.Mesh(seedGeo, seedMat);
    seed1.position.set(0.07, 0.02, 0.05);
    seed1.rotation.z = 0.3;
    group.add(seed1);

    const seed2 = new THREE.Mesh(seedGeo, seedMat);
    seed2.position.set(-0.07, -0.03, -0.04);
    seed2.rotation.z = -0.4;
    group.add(seed2);

    // Brown wooden stem
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.16, 6);
    const stemMat = new THREE.MeshToonMaterial({ color: 0x4E342E });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(0.02, 0.35, 0);
    stem.rotation.z = 0.25;
    group.add(stem);

    // Fresh green leaf
    const leafGeo = new THREE.ConeGeometry(0.055, 0.14, 4);
    const leafMat = new THREE.MeshToonMaterial({ color: 0x43A047 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.set(1.4, 1, 0.3);
    leaf.position.set(0.08, 0.36, 0);
    leaf.rotation.z = -0.8;
    group.add(leaf);

    return group;
  }

  /**
   * 3. Daun Kering (Dry Leaf)
   * Autumn golden-brown curved leaf with spine ridge and stem
   */
  _buildDryLeaf() {
    const group = new THREE.Group();

    // Curved primary leaf blade
    const leafMat = new THREE.MeshToonMaterial({ color: 0xC67D0A, side: THREE.DoubleSide });
    
    // Main leaf body
    const bodyGeo = new THREE.ConeGeometry(0.24, 0.60, 6);
    const body = new THREE.Mesh(bodyGeo, leafMat);
    body.scale.set(1.5, 1, 0.18);
    body.rotation.x = Math.PI / 3.8;
    body.rotation.z = 0.2;
    group.add(body);

    // Central leaf spine / vein (brown)
    const spineGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.65, 6);
    const brownMat = new THREE.MeshToonMaterial({ color: 0x4E342E });
    const spine = new THREE.Mesh(spineGeo, brownMat);
    spine.rotation.x = Math.PI / 3.8;
    spine.rotation.z = 0.2;
    spine.position.set(0, 0.02, 0.04);
    group.add(spine);

    // Petiole (leaf stem extension)
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6);
    const stem = new THREE.Mesh(stemGeo, brownMat);
    stem.position.set(-0.06, -0.32, -0.10);
    stem.rotation.x = 0.3;
    group.add(stem);

    return group;
  }

  /**
   * 4. Sisa Nasi (Leftover Rice in Canteen Bowl with Chopsticks)
   */
  _buildLeftoverRice() {
    const group = new THREE.Group();

    // Red melamine canteen bowl
    const bowlGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.20, 18);
    const bowlMat = new THREE.MeshToonMaterial({ color: 0xD32F2F });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.y = -0.06;
    group.add(bowl);

    // White rim border
    const rimGeo = new THREE.TorusGeometry(0.28, 0.02, 8, 20);
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xFAFAFA });
    const rim = new THREE.Mesh(rimGeo, whiteMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.04;
    group.add(rim);

    // Clumped rice mound
    const riceGeo = new THREE.SphereGeometry(0.24, 12, 10, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const riceMat = new THREE.MeshToonMaterial({ color: 0xF5F5F5, flatShading: true });
    const rice = new THREE.Mesh(riceGeo, riceMat);
    rice.position.y = 0.02;
    group.add(rice);

    // Individual rice grain bumps
    for (let i = 0; i < 6; i++) {
      const gGeo = new THREE.SphereGeometry(0.04, 6, 6);
      gGeo.scale(1, 1.6, 1);
      const grain = new THREE.Mesh(gGeo, whiteMat);
      const ang = (i * Math.PI) / 3;
      grain.position.set(Math.cos(ang) * 0.12, 0.16 + (i % 2) * 0.03, Math.sin(ang) * 0.12);
      grain.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(grain);
    }

    // Pair of wooden chopsticks resting across bowl
    const chopMat = new THREE.MeshToonMaterial({ color: 0xBCAAA4 });
    const c1Geo = new THREE.CylinderGeometry(0.012, 0.018, 0.65, 6);
    const c1 = new THREE.Mesh(c1Geo, chopMat);
    c1.rotation.z = Math.PI / 2.3;
    c1.rotation.x = 0.2;
    c1.position.set(0, 0.16, 0.04);
    group.add(c1);

    const c2 = c1.clone();
    c2.position.set(0.02, 0.17, -0.02);
    group.add(c2);

    return group;
  }

  /**
   * 5. Botol Plastik (Plastic Bottle)
   * Ribbed PET bottle with blue sports cap and white recycling label
   */
  _buildPlasticBottle() {
    const group = new THREE.Group();

    // Main bottle transparent blue cylinder
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.45, 16);
    const petMat = new THREE.MeshToonMaterial({
      color: 0x4FC3F7,
      transparent: true,
      opacity: 0.85
    });
    const body = new THREE.Mesh(bodyGeo, petMat);
    group.add(body);

    // Ribbed grip rings
    const ringMat = new THREE.MeshToonMaterial({ color: 0x29B6F6, transparent: true, opacity: 0.9 });
    for (let y = -0.12; y <= 0.12; y += 0.08) {
      const ringGeo = new THREE.TorusGeometry(0.185, 0.015, 6, 16);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      group.add(ring);
    }

    // Tapered shoulder
    const shoulderGeo = new THREE.CylinderGeometry(0.10, 0.18, 0.14, 16);
    const shoulder = new THREE.Mesh(shoulderGeo, petMat);
    shoulder.position.y = 0.29;
    group.add(shoulder);

    // Bottle neck
    const neckGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 14);
    const neck = new THREE.Mesh(neckGeo, petMat);
    neck.position.y = 0.38;
    group.add(neck);

    // Blue screw cap
    const capGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.07, 12);
    const capMat = new THREE.MeshToonMaterial({ color: 0x0288D1 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.43;
    group.add(cap);

    // White recycling product label band
    const lblGeo = new THREE.CylinderGeometry(0.183, 0.183, 0.16, 16);
    const lblMat = new THREE.MeshToonMaterial({ color: 0xFFFFFF });
    const lbl = new THREE.Mesh(lblGeo, lblMat);
    lbl.position.y = -0.04;
    group.add(lbl);

    return group;
  }

  /**
   * 6. Kaleng Minuman (Soda Can)
   * Red soda can with beveled silver rims, pull tab, and white brand wave
   */
  _buildSodaCan() {
    const group = new THREE.Group();

    // Red aluminum cylinder body
    const bodyGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.50, 18);
    const redMat = new THREE.MeshToonMaterial({ color: 0xE53935 });
    const body = new THREE.Mesh(bodyGeo, redMat);
    group.add(body);

    // White swoosh/wave logo banner
    const bannerGeo = new THREE.CylinderGeometry(0.188, 0.188, 0.18, 18);
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xFFFFFF });
    const banner = new THREE.Mesh(bannerGeo, whiteMat);
    banner.position.y = 0.02;
    group.add(banner);

    // Top silver beveled rim
    const silverMat = new THREE.MeshToonMaterial({ color: 0xCFD8DC });
    const topRimGeo = new THREE.CylinderGeometry(0.165, 0.185, 0.05, 18);
    const topRim = new THREE.Mesh(topRimGeo, silverMat);
    topRim.position.y = 0.27;
    group.add(topRim);

    // Recessed top lid disc
    const lidGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.015, 18);
    const lid = new THREE.Mesh(lidGeo, silverMat);
    lid.position.y = 0.29;
    group.add(lid);

    // Pull-tab on top
    const tabGeo = new THREE.BoxGeometry(0.05, 0.01, 0.09);
    const tab = new THREE.Mesh(tabGeo, silverMat);
    tab.position.set(0, 0.30, 0.03);
    group.add(tab);

    // Bottom silver beveled rim
    const btmRimGeo = new THREE.CylinderGeometry(0.185, 0.165, 0.05, 18);
    const btmRim = new THREE.Mesh(btmRimGeo, silverMat);
    btmRim.position.y = -0.27;
    group.add(btmRim);

    return group;
  }

  /**
   * 7. Bungkus Makanan Ringan (Snack / Chip Wrapper)
   * Crinkled puffy snack pouch with zig-zag serrated crimp seals
   */
  _buildSnackWrapper() {
    const group = new THREE.Group();

    // Puffy pillow-shaped chip bag
    const bagGeo = new THREE.BoxGeometry(0.36, 0.46, 0.14);
    const bagMat = new THREE.MeshToonMaterial({ color: 0xFB8C00 }); // Vibrant orange
    const bag = new THREE.Mesh(bagGeo, bagMat);
    group.add(bag);

    // Yellow starburst / flavor badge
    const badgeGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.02, 8);
    const badgeMat = new THREE.MeshToonMaterial({ color: 0xFFEB3B });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0, 0.04, 0.075);
    group.add(badge);

    // Crimped top foil seal (serrated bar)
    const foilMat = new THREE.MeshToonMaterial({ color: 0xE65100 });
    const topCrimpGeo = new THREE.BoxGeometry(0.38, 0.045, 0.03);
    const topCrimp = new THREE.Mesh(topCrimpGeo, foilMat);
    topCrimp.position.y = 0.24;
    group.add(topCrimp);

    // Crimped bottom foil seal
    const btmCrimp = topCrimp.clone();
    btmCrimp.position.y = -0.24;
    group.add(btmCrimp);

    // Slightly crumpled rotation
    group.rotation.z = -0.15;
    group.rotation.x = 0.1;
    return group;
  }

  /**
   * 8. Kertas Bekas (Crumpled Paper Ball)
   * Multi-faceted crumpled paper with organic angular folds
   */
  _buildCrumpledPaper() {
    const group = new THREE.Group();

    // Faceted paper ball with high detail
    const paperGeo = new THREE.DodecahedronGeometry(0.24, 1);
    
    // Slightly randomize vertex positions for organic crumple effect
    const posAttr = paperGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const jitter = 0.88 + Math.sin(i * 1.7) * 0.18;
      posAttr.setXYZ(i, vx * jitter, vy * jitter, vz * jitter);
    }
    paperGeo.computeVertexNormals();

    const paperMat = new THREE.MeshToonMaterial({
      color: 0xF8FAFC,
      flatShading: true
    });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    group.add(paper);

    // Add faint pencil/notebook doodle stripe
    const ringGeo = new THREE.TorusGeometry(0.23, 0.008, 4, 12);
    const lineMat = new THREE.MeshToonMaterial({ color: 0x90CAF9 });
    const line = new THREE.Mesh(ringGeo, lineMat);
    line.rotation.x = Math.PI / 3;
    group.add(line);

    return group;
  }

  /**
   * 9. Baterai Bekas (Battery)
   * AA Battery with positive terminal (+), negative base (-), and warning band
   */
  _buildBattery() {
    const group = new THREE.Group();

    // Main cylindrical battery casing (Red B3)
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.54, 18);
    const redMat = new THREE.MeshToonMaterial({ color: 0xD32F2F });
    const body = new THREE.Mesh(bodyGeo, redMat);
    group.add(body);

    // Top metal collar (Gold/Brass)
    const goldMat = new THREE.MeshToonMaterial({ color: 0xFDD835 });
    const collarGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.12, 18);
    const collar = new THREE.Mesh(collarGeo, goldMat);
    collar.position.y = 0.21;
    group.add(collar);

    // Positive terminal nipple (+)
    const tipGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.07, 12);
    const silverMat = new THREE.MeshToonMaterial({ color: 0xE0E0E0 });
    const tip = new THREE.Mesh(tipGeo, silverMat);
    tip.position.y = 0.30;
    group.add(tip);

    // Negative terminal bottom flat (-)
    const btmGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.02, 16);
    const btm = new THREE.Mesh(btmGeo, silverMat);
    btm.position.y = -0.27;
    group.add(btm);

    // Hazard warning stripe (black)
    const stripeGeo = new THREE.CylinderGeometry(0.152, 0.152, 0.12, 18);
    const blackMat = new THREE.MeshToonMaterial({ color: 0x212121 });
    const stripe = new THREE.Mesh(stripeGeo, blackMat);
    stripe.position.y = -0.05;
    group.add(stripe);

    // Small yellow lightning bolt symbol
    const boltGeo = new THREE.BoxGeometry(0.04, 0.08, 0.02);
    const bolt = new THREE.Mesh(boltGeo, goldMat);
    bolt.position.set(0, -0.05, 0.15);
    bolt.rotation.z = 0.3;
    group.add(bolt);

    return group;
  }

  /**
   * 10. Lampu Bohlam Rusak (Broken Light Bulb)
   * Pear-shaped glass bulb with metal threaded screw base, brass contact, and tungsten filament
   */
  _buildBrokenBulb() {
    const group = new THREE.Group();

    // Upper glass bulb sphere (warm translucent yellow)
    const bulbGeo = new THREE.SphereGeometry(0.22, 16, 14);
    const glassMat = new THREE.MeshToonMaterial({
      color: 0xFFF9C4,
      transparent: true,
      opacity: 0.85
    });
    const bulb = new THREE.Mesh(bulbGeo, glassMat);
    bulb.position.y = 0.15;
    group.add(bulb);

    // Inner tungsten filament coil (tilted broken loop)
    const filamentMat = new THREE.MeshToonMaterial({ color: 0xFFB300 });
    const loopGeo = new THREE.TorusGeometry(0.07, 0.012, 6, 12);
    const loop = new THREE.Mesh(loopGeo, filamentMat);
    loop.rotation.x = Math.PI / 2.5;
    loop.position.set(0, 0.14, 0);
    group.add(loop);

    // Tapered glass neck
    const neckGeo = new THREE.CylinderGeometry(0.11, 0.18, 0.12, 16);
    const neck = new THREE.Mesh(neckGeo, glassMat);
    neck.position.y = -0.02;
    group.add(neck);

    // Metal threaded screw base (Silver/Grey with ribbed rings)
    const baseMat = new THREE.MeshToonMaterial({ color: 0x78909C });
    const baseGeo = new THREE.CylinderGeometry(0.10, 0.09, 0.18, 14);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.15;
    group.add(base);

    // Thread ridges
    for (let y = -0.10; y >= -0.18; y -= 0.04) {
      const threadGeo = new THREE.TorusGeometry(0.098, 0.012, 6, 14);
      const thread = new THREE.Mesh(threadGeo, baseMat);
      thread.rotation.x = Math.PI / 2;
      thread.position.y = y;
      group.add(thread);
    }

    // Black bottom electrical contact point
    const contactGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.04, 10);
    const contactMat = new THREE.MeshToonMaterial({ color: 0x263238 });
    const contact = new THREE.Mesh(contactGeo, contactMat);
    contact.position.y = -0.25;
    group.add(contact);

    return group;
  }

  /**
   * 11. Wadah Reagen Kimia (Hazardous Chemical Bottle)
   * Purple lab reagent bottle with skull hazard sign and dropper bulb cap
   */
  _buildChemicalBottle() {
    const group = new THREE.Group();

    // Dark purple glass body
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.21, 0.44, 18);
    const purpleMat = new THREE.MeshToonMaterial({ color: 0x6A1B9A });
    const body = new THREE.Mesh(bodyGeo, purpleMat);
    group.add(body);

    // Yellow hazardous warning label band
    const lblGeo = new THREE.CylinderGeometry(0.185, 0.205, 0.18, 18);
    const lblMat = new THREE.MeshToonMaterial({ color: 0xFFEE58 });
    const lbl = new THREE.Mesh(lblGeo, lblMat);
    lbl.position.y = -0.02;
    group.add(lbl);

    // Hazard skull / diamond symbol (black square rotated 45 deg)
    const symGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
    const blackMat = new THREE.MeshToonMaterial({ color: 0x212121 });
    const sym = new THREE.Mesh(symGeo, blackMat);
    sym.rotation.z = Math.PI / 4;
    sym.position.set(0, -0.02, 0.19);
    group.add(sym);

    // Narrow bottle neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.14, 16);
    const neck = new THREE.Mesh(neckGeo, purpleMat);
    neck.position.y = 0.28;
    group.add(neck);

    // Rubber dropper bulb cap
    const capGeo = new THREE.SphereGeometry(0.09, 12, 10);
    const capMat = new THREE.MeshToonMaterial({ color: 0xD32F2F });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.scale.set(1, 1.4, 1);
    cap.position.y = 0.40;
    group.add(cap);

    return group;
  }

  /**
   * 12. Komponen Elektronik (Printed Circuit Board / PCB)
   * Green board with gold traces, black microchip IC with pins, and colorful capacitors
   */
  _buildElectronicPCB() {
    const group = new THREE.Group();

    // Green FR-4 circuit board substrate
    const boardGeo = new THREE.BoxGeometry(0.42, 0.04, 0.32);
    const boardMat = new THREE.MeshToonMaterial({ color: 0x1B5E20 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);

    // Gold edge connector strip
    const edgeGeo = new THREE.BoxGeometry(0.40, 0.042, 0.05);
    const goldMat = new THREE.MeshToonMaterial({ color: 0xFFD54F });
    const edge = new THREE.Mesh(edgeGeo, goldMat);
    edge.position.set(0, 0, 0.135);
    group.add(edge);

    // Main Black IC Microchip
    const chipGeo = new THREE.BoxGeometry(0.16, 0.05, 0.16);
    const chipMat = new THREE.MeshToonMaterial({ color: 0x212121 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(-0.06, 0.035, -0.03);
    group.add(chip);

    // Silver IC solder pins along the sides
    const silverMat = new THREE.MeshToonMaterial({ color: 0xCFD8DC });
    for (let x = -0.12; x <= 0; x += 0.04) {
      const pinGeo = new THREE.BoxGeometry(0.02, 0.02, 0.20);
      const pin = new THREE.Mesh(pinGeo, silverMat);
      pin.position.set(x, 0.025, -0.03);
      group.add(pin);
    }

    // Cylindrical blue capacitor
    const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10);
    const capMat = new THREE.MeshToonMaterial({ color: 0x1E88E5 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0.12, 0.08, -0.06);
    group.add(cap);

    // Small black square transistor
    const transGeo = new THREE.BoxGeometry(0.05, 0.06, 0.04);
    const trans = new THREE.Mesh(transGeo, chipMat);
    trans.position.set(0.11, 0.04, 0.05);
    group.add(trans);

    // Tilted presentation angle
    group.rotation.x = Math.PI / 6;
    group.rotation.y = -Math.PI / 12;
    return group;
  }

  _buildDefaultItem(data) {
    const geo = new THREE.DodecahedronGeometry(0.24);
    const mat = new THREE.MeshToonMaterial({
      color: data.color ? parseInt(data.color.replace('#', '0x')) : 0xFFA726
    });
    return new THREE.Mesh(geo, mat);
  }

  // ==========================================
  // --- FLOATING COMIC NAME TAG SPRITE ---
  // ==========================================

  _createNameTag(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    // Comic Pill Badge Background
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 6;
    
    // Draw rounded badge
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 56, 28);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(8, 8, 240, 56);
      ctx.strokeRect(8, 8, 240, 56);
    }

    // Label Text
    ctx.fillStyle = '#1A202C';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 36);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.95, 0.27, 1);
    sprite.position.y = 0.58;
    return sprite;
  }

  setHovered(isHovered) {
    if (this.state === TRASH_STATES.DRAGGING || this.state === TRASH_STATES.DISPOSED) return;
    
    if (isHovered) {
      this.state = TRASH_STATES.HOVERED;
      this.mesh.scale.set(1.15, 1.15, 1.15);
    } else {
      this.state = TRASH_STATES.IDLE;
      this.mesh.scale.set(1.0, 1.0, 1.0);
    }
  }

  startDrag() {
    this.state = TRASH_STATES.DRAGGING;
    this.mesh.scale.set(1.25, 1.25, 1.25);
  }

  updateDragPosition(worldPosition) {
    if (this.state !== TRASH_STATES.DRAGGING) return;
    this.targetPosition.copy(worldPosition);
    this.mesh.position.lerp(this.targetPosition, 0.75);
  }

  returnToRest() {
    this.state = TRASH_STATES.RETURNING;
    this.mesh.scale.set(1.0, 1.0, 1.0);
  }

  disposeIntoBin(binPosition) {
    this.state = TRASH_STATES.DISPOSED;
    this.targetPosition.copy(binPosition);
  }

  update(delta) {
    if (this.state === TRASH_STATES.IDLE) {
      // Gentle bobbing on desk
      this.bobTimer += delta * 2.5;
      this.mesh.position.y = this.restPosition.y + Math.sin(this.bobTimer) * 0.04;
      this.mesh.rotation.y += delta * 0.4;
    } else if (this.state === TRASH_STATES.RETURNING) {
      this.mesh.position.lerp(this.restPosition, 0.25);
      this.mesh.rotation.x = lerp(this.mesh.rotation.x, 0, 0.2);
      this.mesh.rotation.z = lerp(this.mesh.rotation.z, 0, 0.2);
      
      if (this.mesh.position.distanceTo(this.restPosition) < 0.05) {
        this.mesh.position.copy(this.restPosition);
        this.state = TRASH_STATES.IDLE;
      }
    } else if (this.state === TRASH_STATES.DISPOSED) {
      // Drop down into bin and shrink
      this.mesh.position.lerp(this.targetPosition, 0.3);
      this.mesh.scale.multiplyScalar(0.85);
    }
  }
}
