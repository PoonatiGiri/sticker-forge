require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// ── Category context ──────────────────────────────────────────────────────────

const CATEGORY_CONTEXT = {
  saas:        'for a software product or SaaS startup',
  devtool:     'for a developer tool, CLI, API, or open-source project',
  newsletter:  'for an email newsletter, blog, or independent media publication',
  podcast:     'for a podcast, YouTube channel, or video content creator',
  ai:          'for an AI or machine learning product',
  cafe:        'for a café, coffee shop, or specialty beverage brand',
  restaurant:  'for a restaurant, food brand, or meal delivery service',
  fitness:     'for a fitness brand, gym, or sports company',
  health:      'for a health, wellness, or mental health brand',
  store:       'for a retail shop or e-commerce store',
  fashion:     'for a fashion, apparel, or accessories brand',
  community:   'for an online community, club, or Discord server',
  gaming:      'for a gaming studio, indie game, or esports brand',
  education:   'for an education platform, online course, or coaching service',
  creative:    'for a creative studio, design agency, or independent artist',
  photography: 'for a photography studio or visual content creator',
  finance:     'for a fintech product, personal finance app, or investment service',
  services:    'for a professional services business or freelance agency',
};

// ── Animal / cute character descriptions ─────────────────────────────────────

const ANIMAL_CHARS = {
  saas:        'a round chubby orange tabby kitten, oversized shiny amber eyes, tiny pink nose, sitting upright wearing a tiny astronaut helmet, one small paw raised in greeting. Soft fluffy fur, curled tail',
  devtool:     'a clever raccoon with bright curious eyes, holding a tiny wrench in one paw and a glowing circuit board in the other. Grey-striped fur, ringed bushy tail, small headlamp on forehead',
  newsletter:  'a studious barn owl with large round reading glasses, quill pen tucked behind ear, holding a tiny rolled scroll. Warm amber speckled feathers, wide knowing eyes, thoughtful expression',
  podcast:     'a cheerful golden retriever with big over-ear headphones over floppy ears, a tiny microphone in one raised paw. Warm honey coat, enthusiastic open-mouthed smile, tail mid-wag',
  ai:          'a sleek silver fox with luminous holographic eyes, geometric glowing patterns on fur, floating data fragments orbiting it. Elegant pointed features, electric-blue accent glow on ears and tail tip',
  cafe:        'a chubby honey bear cub with warm golden-brown fur, sparkly round eyes, rosy cheeks, content smile, clutching a small steaming coffee cup in both pudgy paws. Round soft face, small round ears',
  restaurant:  'a round fluffy bear chef in a tall white toque, proud smile, holding up a tiny steaming bowl. Cream-colored fur, food-stained apron, warm inviting expression',
  fitness:     'a lean athletic grey wolf, sharp determined golden eyes, confident smirk, in a powerful forward stance with arms crossed. Cartoon-muscular proportions, pointed ears, silver fur with dark markings',
  health:      'a serene white rabbit with large soft eyes, a lotus flower tucked behind ear, gentle smile, seated in a peaceful meditation pose. Cloud-white fur, pale pink accents, calm healing aura',
  store:       'a fluffy red panda with a big striped bushy tail, wide curious bright eyes, cheerful open smile, holding a tiny shopping bag. Orange-red fur, white-tipped ears, playful energy',
  fashion:     'a sleek elegant cat in tiny round sunglasses, long graceful whiskers, striking spotted coat, one paw raised showing off a tiny accessory. Cool poised expression, sophisticated posture',
  community:   'a round fluffy barn owl with enormous blinking eyes behind tiny round spectacles, wings slightly spread in a warm welcoming embrace. Soft speckled brown-white plumage, small beak, kind expression',
  gaming:      'an energetic red panda gamer with a controller in both hands, wide headset on, excited huge eyes, mid-jump celebration pose. Orange-red fur, white face markings, lightning bolt details',
  education:   'a wise owl professor in a tiny mortarboard cap and small glasses, pointing at a glowing star with a pointer wand. Warm speckled feathers, encouraging smile, holding a tiny open book',
  creative:    'a bright orange fox with a large bushy white-tipped tail, sparkling mischievous eyes, playful smile, holding a tiny paintbrush with a paint dab on its tip. Perky triangular ears, white chest patch',
  photography: 'a fox wearing a vintage beret with a film camera around its neck, peering through the viewfinder with one eye squinted. Orange-tipped fur, artist eager expression, camera strap detail',
  finance:     'a distinguished beaver in a tiny business vest, sharp alert eyes, holding a small gold coin, surrounded by floating mini bar charts. Neat brown fur, reliable earnest expression',
  services:    'a fluffy golden retriever with wavy honey-colored fur, warm kind brown eyes, big friendly smile, wearing a neat little bow-tie, one paw extended in a friendly handshake. Round soft face',
};

// ── Robot / tech character descriptions ──────────────────────────────────────

const ROBOT_CHARS = {
  saas:        'a compact blocky robot with a square head, circular glowing green viewport eyes, small rounded antenna, keyboard-panel chest, tiny hologram displays floating nearby. Curious friendly expression',
  devtool:     'a workshop robot with a toolbox-torso, multi-tool arm with wrench and screwdriver ends, binary-code chest panel, safety goggles pushed up on forehead. Matte chrome with industrial accents',
  newsletter:  'a mailbot robot with envelope-slot mouth, letter-shaped antenna, paper-scroll dispensing from chest, white finish with ink-blue accents. Cheerfully holding a tiny rolled letter',
  podcast:     'a radio-transmitter robot with speaker-cone ears, waveform LED display face, microphone antenna on head, vintage radio-dial torso. Warm brass-and-chrome finish',
  ai:          'a neural-network robot with glowing synaptic connection lines across a transparent chest panel, multiple ring halos orbiting the head, floating data nodes. Sleek white-chrome finish, violet light accents',
  cafe:        'a cute espresso-machine robot with a portafilter arm, steam spout on head, heart-shaped LED display, round coffee-cup body. Warm metallic gold-bronze tones, cheerful blinking eyes',
  restaurant:  'a kitchen robot chef with mixing-bowl torso, whisk arm, temperature-gauge eye, chef-toque hat shaped like a pressure cooker lid. Warm copper-chrome finish, steam rising',
  fitness:     'a sporty robot with visible hydraulic piston legs, speedometer gauge on chest, tiny dumbbell in one hand, aerodynamic helmet-head. Dynamic lunging pose, chrome finish with bright accents',
  health:      'a wellness robot with a heart-rate-monitor screen chest, soothing green glow, meditation lotus icon display, soft rounded edges. Pastel-white finish with mint-green accents',
  store:       'a shopping-cart robot with a receipt-tape antenna, barcode-pattern torso, price-tag badge on chest, cheerful blinking LED eyes, little wheels for feet. Helpful welcoming pose',
  fashion:     'a haute-couture robot in a tiny designer jacket, laser-cut geometric pattern body, color-swatch display panel on arm, elongated elegant proportions. Silver-chrome with gold trim',
  community:   'a broadcast-tower robot with a megaphone head, radio-wave arms spread wide in an inclusive gesture, retro walkie-talkie body, signal-bar meter on chest. Waves radiating outward',
  gaming:      'a gaming rig robot with joystick-grip hands, pixel-display face showing an 8-bit excited expression, RGB light strips on body, headset antenna. Matte black finish with neon accent lighting',
  education:   'a chalkboard robot with a whiteboard chest panel covered in equations, pointing-stick arm, graduation-cap head, friendly glowing eyes. Classic black finish with golden accents',
  creative:    'an artist robot with one arm ending in a paintbrush, color-swatch palette chest panel, paint splatters on fingers, creative sparks shooting from antenna. Joyful expression',
  photography: 'a camera robot with a large lens eye that rotates and focuses, aperture-blade shutter blink, film-strip belt, flash-cube shoulder mount. Classic black-and-silver finish',
  finance:     'a fintech robot with a coin-slot chest, mini stock-ticker arm display, calculator-pattern torso, tiny suit jacket etched in chrome. Polished platinum finish, trustworthy expression',
  services:    'a polished professional helper robot in a tiny suit jacket with pocket square, clipboard in one hand, chrome finish, warm glowing amber eyes. Poised and helpful stance',
};

// ── Cartoon human / figure descriptions ──────────────────────────────────────

const HUMAN_CHARS = {
  saas:        'a stylized cartoon tech person: oversized round head, square glasses, hoodie, messy hair, holding a glowing laptop. Code brackets floating nearby. Enthusiastic wide-eyed expression',
  devtool:     'a cartoon hacker in a hoodie with binary-code patterns, intense focused eyes behind wire-frame glasses, energy drink in one hand, code snippets swirling around them',
  newsletter:  'a cartoon writer at a tiny typewriter, cozy scarf, coffee cup nearby, glasses on nose, excited expression as words materialize in the air',
  podcast:     'a cartoon podcaster with large over-ear headphones, microphone in hand, mid-sentence animated expression, casual tee with a soundwave chest print',
  ai:          'a cartoon AI researcher in a lab coat, holding a glowing neural-network diagram, curious wide eyes, data symbols and equations floating around the head',
  cafe:        'a round-headed cartoon barista in a white apron, warm smile, holding a coffee cup with steam curling upward. Rosy cheeks, rolled-up sleeves, approachable',
  restaurant:  'a cartoon chef in crisp whites and tall toque, tasting spoon raised, satisfied chef-kiss expression, swirls of steam rising behind them',
  fitness:     'a cartoon athlete with a determined expression, sweatband, dynamic action pose, simplified strong proportions. Energy lines radiating outward',
  health:      'a cartoon wellness coach in athletic wear, arms raised overhead in a yoga pose, serene bright smile, small halo of green leaves around the head',
  store:       'a cheerful cartoon shopkeeper in an apron, price tag in hand, welcoming smile, slightly bowing in greeting. Friendly and approachable proportions',
  fashion:     'a stylish cartoon designer in a chic outfit, sketchpad and pencil raised, fashionable accessories, confident runway-ready posture',
  community:   'a cartoon organizer with a megaphone, star badge on chest, big welcoming smile, one fist raised in a celebratory gesture',
  gaming:      'a cartoon gamer hunched forward in competitive focus, controller grip, headset on, energy aura around hands, determined expression',
  education:   'a cartoon teacher with glasses and a pointing stick, bright encouraging smile, colorful open book in one hand, floating sticky-note ideas nearby',
  creative:    'a cartoon artist in a splattered beret and smock, paintbrushes in pocket, dreamy inspired expression looking upward with wonder',
  photography: 'a cartoon photographer in a vest with pockets, large camera raised to eye, crouching in a dynamic shooting stance, playful wink',
  finance:     'a confident cartoon financial advisor in a sharp suit, tablet showing upward charts, warm reassuring thumbs-up gesture. Trustworthy expression',
  services:    'a confident cartoon professional, briefcase, collared shirt, clean look, and a warm reassuring thumbs-up gesture. Trustworthy expression',
};

// ── Fantasy creature descriptions ────────────────────────────────────────────

const FANTASY_CHARS = {
  saas:        'a tiny wise code-wizard with round spectacles, digital spell-book floating open, casting holographic spells from fingertips. Purple and indigo robes with circuit-board patterns',
  devtool:     'a sleek mechanical dragon made of interlocking gears and circuit wings, binary-code scales, glowing terminal-green eyes. Electric sparks from nostrils',
  newsletter:  'a magical paper-golem made of origami birds and scrolls, ink-purple glowing eyes, quill wand, surrounded by floating letters and words',
  podcast:     'a music-sprite with large headphone-shaped wings, microphone wand, vibrant soundwave aura radiating outward. Electric cyan and magenta tones',
  ai:          'an elegant digital phoenix made of flowing data streams, neural-pattern wings of light, eyes like deep-learning vortices. Electric blue and violet glow',
  cafe:        'a cozy coffee-spirit creature shaped like a teapot, steam arms curling playfully, warm honey-amber body, tiny cup horns. Friendly mystical glow',
  restaurant:  'a cheerful kitchen genie bursting from a cooking pot, chef toque, magic ladle wand, swirls of aromatic flavor magic around it. Warm saffron and spice tones',
  fitness:     'a fierce fire phoenix in a combat stance, blazing wings spread wide, muscular proportions, intense determined eyes. Ember and flame color palette',
  health:      'a gentle forest spirit made of leaves and soft vines, warm glowing core, healing light radiating from outstretched hands. Mossy greens and warm golds',
  store:       'a mischievous shop-sprite with a gift bow on its head, magic wand tipped with a price-tag star, pockets full of tiny coins. Gold and coral tones',
  fashion:     'a glamorous style-fae with butterfly wings made of colorful fabric swatches, sewing-needle wand, trailing silk ribbons. Iridescent pastel tones',
  community:   'a friendly gathering-spirit with multiple arms reaching outward in welcome, warm golden glow, surrounded by orbiting stars and hearts',
  gaming:      'a powerful pixel-wizard in 8-bit robe, casting retro game-sprite spells, game-controller staff, floating power-up icons around. Vivid game-primary colors',
  education:   'a scholarly owl-wizard in cap and gown with magical animated star charts, wisdom glow from an open ancient tome. Deep blue and gold academic robes',
  creative:    'an art-muse sprite dancing in a swirl of paint and light, brush wand painting reality into being, trailing rainbow sparks of creativity',
  photography: 'a vision-sprite with a magical camera-lens eye that captures light itself, surrounded by orbiting starburst frames, made of captured memories. Silver and gold',
  finance:     'a wealth-guardian spirit in classical toga holding golden scales, laurel-wreath staff, noble and commanding. Roman gold and marble white tones',
  services:    'a helpful djinn floating from a vintage briefcase, formal attire, holding scrolls of expertise, graciously ready to grant professional wishes. Burgundy and gold',
};

// ── Food / object character descriptions ─────────────────────────────────────

const FOOD_CHARS = {
  saas:        'a smiling floppy-disk character with tiny legs and waving arms, cute pixel face on the label, cheerful and retro. Chrome-and-label colors',
  devtool:     'a cheerful coffee-mug character with a wrench for a handle, tool-belt around the mug body, determined expressive face. Industrial yet cozy',
  newsletter:  'a cheerful envelope character with googly eyes and little legs, heart-stamp seal, waving and running. Cream and red-stamp color palette',
  podcast:     'an anthropomorphic microphone character with a big round face, soundwave hair, rocking out with tiny arms. Classic silver body with personality',
  ai:          'a brain character with circuit-board texture across its surface, glowing synaptic sparks, cute blinking eyes, floating gently. Pink-white with electric blue circuits',
  cafe:        'a chubby latte-cup character with cream foam hair, cinnamon-dusted rosy cheeks, tiny steam-curl arms, happy sipping expression. Warm coffee tones',
  restaurant:  'a plump ramen-bowl character with wavy noodle hair, steam arms, chopstick legs, happy slurping expression. Warm orange and cream tones',
  fitness:     'a dumbbell character with a tiny head between the two weights, determined expression, flexing tiny side-arms. Chrome silver with neon green accent',
  health:      'a green smoothie cup character with leafy straw-hair, healthy glowing complexion, doing a tree yoga pose. Vibrant green and white',
  store:       'a shopping-bag character with handle ears, a receipt-paper smile, window-display eyes, little legs trotting happily. Kraft-brown with a colorful logo',
  fashion:     'a stylish high-heel shoe character with an elegant face, tiny fascinator hat, striking a sassy catwalk pose. Chic black and gold',
  community:   'a large speech-bubble character with a wide grin, smaller speech-bubbles orbiting it like satellites. Friendly blue and white',
  gaming:      'a retro game cartridge character with a pixel face, joystick-shaped arms, doing a victory jump. Classic beige cartridge with a colorful label',
  education:   'a pencil character with a graduation-cap tip eraser, tiny legs, open-book backpack, eager learning expression. Classic yellow #2 pencil look',
  creative:    'a paint-tube character squeezing out a colorful splat smile, artist beret on cap, holding a tiny palette proudly. Vivid multicolor paint tones',
  photography: 'a vintage SLR camera character with big round lens eyes, flash-bulb forehead, winding-knob ears, happy shutter-click expression. Classic black finish',
  finance:     'an animated gold coin character with a face embossed on it, tiny suit jacket, carrying a mini briefcase. Warm gold with embossed details',
  services:    'a briefcase character with a professional face on the clasp, bow-tie accent, standing upright in a dignified helpful posture. Leather-brown and gold',
};

// ── Superhero / action character descriptions ─────────────────────────────────

const HERO_CHARS = {
  saas:        'a cartoon tech superhero in a sleek suit with code-bracket chest emblem, cape made of streaming data, mid-flight pose. Purple and white color palette',
  devtool:     'a dev-hero in a hoodie-cape hybrid, keyboard shield in one hand, debug-laser glove on the other, heroic power stance. Dark navy with circuit-board accents',
  newsletter:  'a journalist-hero in a press-hat and sweeping cape, notepad shield, pen wand, dramatic wind-blown stance. Retro newspaper blue-and-white palette',
  podcast:     'a sound-hero with speaker-wave powers radiating from hands, headphones as a power crown, dynamic action mid-air pose. Electric orange and black',
  ai:          'a sleek AI-superhero with a glowing neural halo, data-stream cape, lightning-bolt hands, confident floating pose. Electric indigo and white',
  cafe:        'a barista-hero in a cape-apron, coffee-cup shield, steam-jet arm blast, ready for action. Rich coffee-brown and gold tones',
  restaurant:  'a chef-superhero with a whisk wand, toque as a helmet, dramatic flavor-blast attack pose. Kitchen whites with vivid color-flash accents',
  fitness:     'a muscular fitness superhero in a power pose, energy field around flexing arms, gym-emblem on chest, determined laser-focus eyes. Bold primary colors',
  health:      'a wellness hero in a soft organic-green suit, healing aura from outstretched hands, leaf-wing cape, serene powerful expression. Green and warm gold',
  store:       'a shopping hero with a cart-shield and coupon-sword, dynamic running pose, ready to battle bad deals. Energetic red and yellow',
  fashion:     'a style superhero in a runway-cape, fabric-whip in hand, launching colorful fashion-blast powers, fierce and glamorous. Black and iridescent',
  community:   'a community champion with a megaphone shield, star-shaped power aura, arms raised rallying a crowd. Warm red and gold',
  gaming:      'a gamer-hero in futuristic battle armor, power-glove controller hand, energy sword from a console, epic battle stance. Deep purple and neon accents',
  education:   'a knowledge hero with a book-shield and pencil-lance, graduation cape, wisdom aura floating around. Academic blue and gold',
  creative:    'an art-hero with paint-splatter powers, brush-saber in hand, color-spectrum cape, leaping in creative joy. Multicolor explosion palette',
  photography: 'a photo-hero with a camera-cannon arm, flash-blast powers, shooting dramatic light-frame bursts, lens-goggles on. Black and silver',
  finance:     'a finance champion in a sharp suit, shield made of stacked gold coins, upward-trend chart as a weapon, commanding pose. Navy and gold',
  services:    'a professional hero in a business suit-armor, clipboard shield, confident poised stance, "DELIVERED" badge on chest. Charcoal and gold',
};

// ── Art style / vibe descriptions ────────────────────────────────────────────

const VIBES = {
  cute: {
    art:  'kawaii vector illustration — rounded bubble proportions, flat colors, clean thick black outlines (3px). Pastel candy palette (mint, lavender, peach) with one vibrant accent pop. Similar to LINE Friends or Duolingo character art. Cheerful, soft, approachable. White background.',
    font: 'bold rounded sans-serif (like Nunito ExtraBold or Fredoka One), friendly bubble-letter feel',
  },
  bold: {
    art:  'bold graphic pop-art sticker — very thick black outlines (5px), high-contrast primary colors (red, yellow, blue). Hard drop shadows, energetic off-kilter composition. Like a streetwear brand or skate sticker. White background.',
    font: 'heavy impact slab-serif, all-caps, aggressive. Thick black stroke with a hard drop shadow',
  },
  clean: {
    art:  'minimal flat vector design — simple geometric shapes, clean precision, 3 bold spot colors only, no gradients or textures, generous white space. Bauhaus / Swiss graphic design influence. White background.',
    font: 'clean modern geometric sans-serif (Futura or Montserrat Bold), tight letter-spacing, minimal',
  },
  retro: {
    art:  '1960s Americana screenprint — 3-color halftone print look, aged grain texture overlay, bold condensed display lettering, circular badge frame. Warm palette: rust orange, cream, forest green. Feels like a vintage travel patch. Cream background.',
    font: 'bold vintage condensed serif display font, slightly distressed letterpress texture',
  },
  tech: {
    art:  'cyberpunk vector — near-black background (#0d0d1a), neon electric-green (#00ff88) and hot magenta (#ff0055) glow accents. Sharp angular shapes, subtle scan-line texture, digital glitch micro-details. Futuristic hacker aesthetic.',
    font: 'monospace or tech-display font (Share Tech Mono style) with subtle neon glow matching the accents',
  },
  stamp: {
    art:  'Victorian rubber stamp engraving — ornate oval frame with fine decorative line work, monochrome sepia-brown, letterpress ink texture, engraving illustration style. Official government seal aesthetic. Aged cream/tan background.',
    font: 'ornate letterpress serif, slightly pressed and embossed appearance, very formal',
  },
  handdrawn: {
    art:  'hand-drawn sketch illustration — loose confident ink linework, subtle cross-hatching for shading, slight paper texture overlay, organic imperfect lines. 2-3 color palette with one dominant ink tone. Feels like a talented sketchbook doodle or indie zine. Off-white background.',
    font: 'hand-lettered irregular brush font, slightly wobbly baseline, like a marker or ink pen',
  },
  pixel: {
    art:  '16-bit pixel art — crisp square pixels, limited palette of 16 colors, chunky character sprites with visible pixel grid. NES/SNES era video game aesthetic. Clean pixel-art white or solid-color background.',
    font: 'classic pixel bitmap font (Press Start 2P style), monospace grid-aligned, sharp pixel edges, no anti-aliasing',
  },
  synthwave: {
    art:  '80s synthwave / retrowave — deep purple-navy background, neon pink (#ff6ec7) and cyan (#00f5ff) gradient accents, chrome-style text with outer glow, subtle perspective-grid horizon line. Nostalgic 1980s computer graphics aesthetic.',
    font: 'italic chrome display font with outer neon glow, 80s laser-cut lettering style, slightly slanted',
  },
  pastel: {
    art:  'soft pastel dream illustration — delicate watercolor washes, fine elegant line weight, blurred dreamy edges. Palette: rose, lavender, sage, and warm cream. Art nouveau meets modern kawaii. Soft white background with subtle texture.',
    font: 'elegant thin serif or flowing script font, graceful letterforms, in soft rose or gold',
  },
  '3d': {
    art:  '3D-rendered soft clay character in Pixar–Illumination studio style — round voluminous forms, subsurface scattering on smooth skin and material surfaces, three-point studio lighting with a soft warm key light and cool rim light, ambient occlusion in crevices, physically-based rendering. Vivid vibrant solid-color gradient background. No black outlines — pure volumetric 3D shading only. Cinematic render quality, professional CG character illustration.',
    font: 'bold 3D extruded rounded lettering with a soft drop shadow and slight bevel, chunky friendly bubble-letter feel',
  },
};

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildGuidedPrompt(name, category, mascotType, vibe, details, refinement, inspirationStyle, format) {
  const v = VIBES[vibe] || VIBES.cute;
  const context = CATEGORY_CONTEXT[category] || CATEGORY_CONTEXT.saas;
  const displayName = name?.trim() || '';

  let p = format === 'appicon'
    ? 'Professional character illustration in app-icon format — character centered on a vivid solid-color gradient background, rounded-square composition. No sticker border. '
    : 'Die-cut vinyl sticker with a thick white outline border on a white background. ';

  if (mascotType === 'badge') {
    p += `Bold graphic badge logo sticker ${context}. `;
    if (displayName) {
      p += `The name "${displayName}" is the centerpiece — large, prominent, typographically strong. Typography: ${v.font}. `;
    }
    p += 'No character or mascot. Strong icon/symbol combined with the name text. ';
  } else {
    let charDesc;
    if      (mascotType === 'robot')   charDesc = ROBOT_CHARS[category]   || ROBOT_CHARS.saas;
    else if (mascotType === 'human')   charDesc = HUMAN_CHARS[category]   || HUMAN_CHARS.saas;
    else if (mascotType === 'fantasy') charDesc = FANTASY_CHARS[category] || FANTASY_CHARS.saas;
    else if (mascotType === 'food')    charDesc = FOOD_CHARS[category]    || FOOD_CHARS.saas;
    else if (mascotType === 'hero')    charDesc = HERO_CHARS[category]    || HERO_CHARS.saas;
    else                               charDesc = ANIMAL_CHARS[category]  || ANIMAL_CHARS.saas;

    p += `Main character: ${charDesc}. `;
    p += `Context: ${context}. `;
    if (displayName) p += `Below the character, include the name "${displayName}" in ${v.font}. `;
  }

  p += `${v.art} `;
  if (inspirationStyle?.trim()) p += `Mood / inspiration style: ${inspirationStyle.trim()}. `;
  if (details?.trim())          p += `Extra direction: ${details.trim()}. `;
  if (refinement?.trim())       p += `Refinement: ${refinement.trim()}. `;
  p += 'Bold and memorable. Legible at 2-inch printed sticker size. Maximum 5 colors. Designed for laptop sticker use.';
  return p;
}

function buildCustomPrompt(description, style, name, refinement, inspirationStyle, format) {
  const STYLE_PROMPTS = {
    mascot:    'kawaii illustrated mascot — big expressive eyes, soft rounded shapes, vibrant flat colors, die-cut sticker, thick clean black outlines. White background.',
    retro:     'retro vintage badge sticker — 1960s Americana, bold condensed lettering, 3-color screenprint, circular shape, distressed texture.',
    tech:      'cyberpunk hacker sticker — dark background, neon glow accent colors, geometric shapes, sci-fi vector illustration.',
    minimal:   'minimal flat vector sticker — simple bold geometric shapes, modern sans-serif, 2-3 bold colors, white background, clean.',
    cartoon:   'bold cartoon sticker — very thick black outlines, high-contrast primary colors, expressive character, pop-art energy. White background.',
    stamp:     'vintage rubber stamp sticker — ornate border, monochrome or duotone, engraving illustration, official seal aesthetic.',
    handdrawn: 'hand-drawn sketch sticker — confident ink linework, cross-hatching shading, organic imperfect feel, zine aesthetic.',
    pixel:     'pixel art sticker — crisp 16-bit sprites, limited color palette, NES/SNES game aesthetic, grid-aligned pixels.',
    synthwave: '80s synthwave sticker — neon pink and cyan, chrome lettering, purple-navy background, retro computer graphics.',
    pastel:    'soft pastel illustration — watercolor washes, delicate linework, dreamy rose-lavender palette, art nouveau feel.',
  };
  const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.mascot;
  let p = format === 'appicon'
    ? 'Professional character illustration in app-icon format — character centered on a vivid solid-color gradient background, rounded-square composition. No sticker border. '
    : 'Die-cut sticker with thick white border outline on white background. ';
  p += `Concept: ${description.trim()}. `;
  if (name?.trim()) p += `Include the name "${name.trim()}" as text in the design. `;
  p += `${styleDesc} `;
  if (inspirationStyle?.trim()) p += `Mood / inspiration style: ${inspirationStyle.trim()}. `;
  if (refinement?.trim())       p += `Refinement: ${refinement.trim()}. `;
  p += 'Bold, memorable, legible at 2-inch sticker size.';
  return p;
}

// ── Vision: analyze inspiration images ───────────────────────────────────────

async function analyzeInspirationImages(openai, images) {
  if (!images || !images.length) return null;
  try {
    const content = [
      {
        type: 'text',
        text: 'These are mood board / inspiration images for a sticker design. In 1-2 sentences, describe the dominant visual style, color palette, and artistic mood. Be specific and concrete (e.g. "warm earth tones, hand-drawn thick outlines, playful retro energy"). Output only the style description, nothing else.',
      },
      ...images.slice(0, 3).map(img => ({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${img}`, detail: 'low' },
      })),
    ];
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [{ role: 'user', content }],
    });
    return resp.choices[0].message.content?.trim() || null;
  } catch (e) {
    console.warn('Vision analysis failed:', e.message);
    return null;
  }
}

// ── API endpoint ──────────────────────────────────────────────────────────────

app.post('/api/generate', async (req, res) => {
  const {
    mode, name, category, mascotType, vibe, details,
    description, style, refinement,
    inspirationImages,  // array of base64 strings (up to 3)
    format,             // 'sticker' | 'appicon'
  } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sk-...your-key-here') {
    return res.status(500).json({ error: 'OPENAI_API_KEY not set. Copy .env.example to .env and add your key.' });
  }

  const openai = new OpenAI({ apiKey });

  // Analyse inspiration images if provided
  let inspirationStyle = null;
  if (Array.isArray(inspirationImages) && inspirationImages.length > 0) {
    inspirationStyle = await analyzeInspirationImages(openai, inspirationImages);
    if (inspirationStyle) console.log('Inspiration style extracted:', inspirationStyle);
  }

  let prompt;
  if (mode === 'guided') {
    if (!name?.trim() && !details?.trim()) {
      return res.status(400).json({ error: 'Enter a name or add some details to get started' });
    }
    prompt = buildGuidedPrompt(name, category || 'saas', mascotType || 'animal', vibe || 'cute', details, refinement, inspirationStyle, format || 'sticker');
  } else {
    if (!description?.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }
    prompt = buildCustomPrompt(description, style, name, refinement, inspirationStyle, format || 'sticker');
  }

  // Three separate calls with different composition notes → genuinely varied output
  const COMP_NOTES = [
    'Composition A: symmetrical centered, character facing viewer directly, calm and balanced.',
    'Composition B: dynamic off-center diagonal, character in a lively action pose, energetic.',
    'Composition C: close-up three-quarter angle, character slightly turned, different color emphasis.',
  ];

  try {
    const results = await Promise.all(
      COMP_NOTES.map((note) =>
        openai.images.generate({
          model: 'gpt-image-1',
          prompt: `${prompt} ${note}`,
          n: 1,
          size: '1024x1024',
          quality: 'high',
        })
      )
    );
    const images = results.map((r) => r.data[0].b64_json);
    res.json({ images, inspirationStyle });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`\n🎨  StickerForge → http://localhost:${PORT}\n`);
});
