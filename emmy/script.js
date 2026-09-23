/**
 * ==============================================================================
 * BATALHA POKÉMON — LÓGICA PRINCIPAL (JAVASCRIPT)
 * Projeto Escolar: HTML, CSS e JavaScript puros
 * ==============================================================================
 */

// ==========================================
// 1. BANCO DE DADOS DOS 8 POKÉMON
// ==========================================
const POKEMON_DATA = [
  {
    id: 1,
    name: "Pikachu",
    type: "Elétrico",
    typeClass: "type-eletrico",
    badgeIcon: "⚡",
    description: "Um Pokémon pequeno e ágil que utiliza eletricidade para atacar seus adversários.",
    characteristic: "Ataques rápidos.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    // Habilidade: Chance de Ataque Duplo
    passiveId: "speed"
  },
  {
    id: 2,
    name: "Charizard",
    type: "Fogo / Voador",
    typeClass: "type-fogo",
    badgeIcon: "🔥",
    description: "Um poderoso Pokémon que possui chamas na ponta da cauda e pode voar.",
    characteristic: "Ataques fortes.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    // Habilidade: +15% de Dano contínuo
    passiveId: "power"
  },
  {
    id: 3,
    name: "Mewtwo",
    type: "Psíquico",
    typeClass: "type-psiquico",
    badgeIcon: "🔮",
    description: "Um Pokémon criado artificialmente, conhecido por seus grandes poderes psíquicos.",
    characteristic: "Ataque especial poderoso.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    // Habilidade: Especial devastador (+30% de dano no Especial)
    passiveId: "special"
  },
  {
    id: 4,
    name: "Blastoise",
    type: "Água",
    typeClass: "type-agua",
    badgeIcon: "💧",
    description: "Um Pokémon resistente que utiliza os canhões de água em seu casco durante as batalhas.",
    characteristic: "Defesa maior.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    // Habilidade: Recebe 20% menos dano
    passiveId: "defense"
  },
  {
    id: 5,
    name: "Venusaur",
    type: "Planta / Veneno",
    typeClass: "type-planta",
    badgeIcon: "🌿",
    description: "Um Pokémon que possui uma grande flor nas costas e utiliza poderes relacionados à natureza.",
    characteristic: "Pode recuperar uma pequena quantidade de HP.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    // Habilidade: Cura 10 HP ao atacar
    passiveId: "heal"
  },
  {
    id: 6,
    name: "Gengar",
    type: "Fantasma / Veneno",
    typeClass: "type-fantasma",
    badgeIcon: "👻",
    description: "Um Pokémon misterioso que costuma aparecer escondido nas sombras.",
    characteristic: "Chance de ataque crítico.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    // Habilidade: 35% de chance de crítico (1.8x)
    passiveId: "crit"
  },
  {
    id: 7,
    name: "Lucario",
    type: "Lutador / Aço",
    typeClass: "type-lutador",
    badgeIcon: "🥊",
    description: "Um Pokémon habilidoso capaz de perceber e utilizar a energia ao seu redor.",
    characteristic: "Dano equilibrado.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
    // Habilidade: Dano mínimo elevado e estável
    passiveId: "balanced"
  },
  {
    id: 8,
    name: "Greninja",
    type: "Água / Sombrio",
    typeClass: "type-agua",
    badgeIcon: "💧",
    description: "Um Pokémon rápido e habilidoso que utiliza movimentos ágeis para surpreender seus adversários.",
    characteristic: "Ataques rápidos.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png",
    // Habilidade: Ataque Rápido tem bônus de dano (+25%)
    passiveId: "fast"
  }
];

// ==========================================
// 2. ESTADO DO JOGO
// ==========================================
const MAX_HP = 100;

let playerPokemon = null;
let enemyPokemon = null;

let playerHP = MAX_HP;
let enemyHP = MAX_HP;

let playerComboCount = 0;
let totalCombosAchieved = 0;
let totalTurns = 0;

let isTurnInProgress = false;
let isBattleOver = false;

// Efeitos temporários de eventos surpresa
let surpriseEffect = null; // 'defense_buff' | 'crit_guaranteed' | 'dmg_buff'

// ==========================================
// 3. EFEITOS SONOROS RETRÔ (WEB AUDIO API)
// Não necessita de arquivos externos!
// ==========================================
const SoundFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  playTone(freq, type, duration, delay = 0) {
    try {
      this.init();
      if (!this.ctx) return;
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      }, delay * 1000);
    } catch (e) {
      // Ignora silenciosamente se o navegador bloquear autoplay
    }
  },
  attack() {
    this.playTone(320, "sawtooth", 0.1);
    this.playTone(480, "triangle", 0.15, 0.08);
  },
  hit() {
    this.playTone(150, "square", 0.2);
    this.playTone(90, "sawtooth", 0.25, 0.05);
  },
  special() {
    this.playTone(280, "sine", 0.1);
    this.playTone(420, "sine", 0.1, 0.08);
    this.playTone(600, "sawtooth", 0.25, 0.16);
  },
  heal() {
    this.playTone(440, "triangle", 0.1);
    this.playTone(660, "triangle", 0.1, 0.08);
    this.playTone(880, "sine", 0.2, 0.16);
  },
  victory() {
    this.playTone(523.25, "square", 0.15, 0.0);
    this.playTone(659.25, "square", 0.15, 0.15);
    this.playTone(783.99, "square", 0.15, 0.3);
    this.playTone(1046.50, "square", 0.35, 0.45);
  },
  defeat() {
    this.playTone(400, "sawtooth", 0.2, 0.0);
    this.playTone(320, "sawtooth", 0.25, 0.2);
    this.playTone(200, "sawtooth", 0.4, 0.45);
  }
};

// ==========================================
// 4. ELEMENTOS DO DOM
// ==========================================
const DOM = {
  // Telas
  selectionScreen: document.getElementById("selection-screen"),
  battleScreen: document.getElementById("battle-screen"),
  pokemonGrid: document.getElementById("pokemon-grid"),
  
  // Topo da Batalha
  btnBackSelect: document.getElementById("btn-back-select"),
  comboBadge: document.getElementById("combo-badge"),
  comboText: document.getElementById("combo-text"),
  surpriseBadge: document.getElementById("surprise-badge"),
  surpriseText: document.getElementById("surprise-text"),
  criticalAlert: document.getElementById("critical-alert"),
  turnIndicator: document.getElementById("turn-indicator"),

  // Jogador
  playerStatusCard: document.getElementById("player-status-card"),
  playerTypeBadge: document.getElementById("player-type-badge"),
  playerName: document.getElementById("player-name"),
  playerFeature: document.getElementById("player-feature"),
  playerHPText: document.getElementById("player-hp-text"),
  playerHPBar: document.getElementById("player-hp-bar"),
  playerSprite: document.getElementById("player-sprite"),
  playerDamageContainer: document.getElementById("player-damage-container"),

  // Adversário
  enemyStatusCard: document.getElementById("enemy-status-card"),
  enemyTypeBadge: document.getElementById("enemy-type-badge"),
  enemyName: document.getElementById("enemy-name"),
  enemyFeature: document.getElementById("enemy-feature"),
  enemyHPText: document.getElementById("enemy-hp-text"),
  enemyHPBar: document.getElementById("enemy-hp-bar"),
  enemySprite: document.getElementById("enemy-sprite"),
  enemyDamageContainer: document.getElementById("enemy-damage-container"),

  // Battle Log & Botões
  battleLog: document.getElementById("battle-log"),
  btnQuick: document.getElementById("btn-quick-attack"),
  btnStrong: document.getElementById("btn-strong-attack"),
  btnSpecial: document.getElementById("btn-special-attack"),

  // Modal de Fim de Jogo
  resultModal: document.getElementById("result-modal"),
  modalCard: document.querySelector(".modal-card"),
  modalIcon: document.getElementById("modal-icon"),
  modalTitle: document.getElementById("modal-title"),
  modalDesc: document.getElementById("modal-description"),
  statTurns: document.getElementById("stat-turns"),
  statCombos: document.getElementById("stat-combos"),
  btnPlayAgain: document.getElementById("btn-play-again")
};

// ==========================================
// 5. INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================
function initApp() {
  // Garante que o modal de resultado e a arena de batalha comecem 100% ocultos
  DOM.resultModal.classList.add("hidden");
  DOM.resultModal.style.display = "none";
  DOM.battleScreen.classList.add("hidden");
  DOM.battleScreen.style.display = "none";
  DOM.selectionScreen.classList.remove("hidden");
  DOM.selectionScreen.style.display = "block";

  renderPokemonSelection();
  setupEventListeners();
}


/**
 * Renderiza os 8 cards de Pokémon com efeito 3D suave
 */
function renderPokemonSelection() {
  DOM.pokemonGrid.innerHTML = "";

  POKEMON_DATA.forEach(poke => {
    // Wrapper para conter a perspectiva 3D
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "pokemon-card-wrapper";

    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.dataset.id = poke.id;

    card.innerHTML = `
      <div class="card-shine"></div>
      <div class="card-header">
        <span class="type-badge ${poke.typeClass}">${poke.badgeIcon} ${poke.type}</span>
      </div>
      <div class="card-img-wrapper">
        <img class="pokemon-card-img" src="${poke.image}" alt="${poke.name}" loading="lazy">
      </div>
      <h3 class="card-name">${poke.name}</h3>
      <p class="card-desc">${poke.description}</p>
      <div class="card-feature-box">
        <span class="feature-label">Característica</span>
        <span class="feature-val">${poke.characteristic}</span>
      </div>
      <button class="btn-choose">Escolher</button>
    `;

    // Aplica o Efeito 3D ao movimentar o mouse
    attach3DTiltEffect(card);

    // Evento de seleção do Pokémon
    card.addEventListener("click", () => {
      startBattle(poke);
    });

    cardWrapper.appendChild(card);
    DOM.pokemonGrid.appendChild(cardWrapper);
  });
}

/**
 * Efeito 3D nos Cards utilizando transformações CSS suaves
 */
function attach3DTiltEffect(card) {
  const shine = card.querySelector(".card-shine");

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Inclinação sutil (-12 a +12 graus)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -6px, 0)`;

    // Iluminação especular holográfica
    if (shine) {
      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
      shine.style.opacity = "1";
    }
  });

  card.addEventListener("mouseleave", () => {
    // Retorno suave à posição original
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)";
    if (shine) {
      shine.style.opacity = "0";
    }
  });
}

// ==========================================
// 6. INÍCIO DA BATALHA & SORTEIO DO ADVERSÁRIO
// ==========================================
function startBattle(selectedPokemon) {
  playerPokemon = selectedPokemon;

  // Sorteia um adversário aleatório entre os outros 7 (nunca repete o jogador)
  const availableEnemies = POKEMON_DATA.filter(p => p.id !== selectedPokemon.id);
  const randomIndex = Math.floor(Math.random() * availableEnemies.length);
  enemyPokemon = availableEnemies[randomIndex];

  // Reset dos atributos de combate
  playerHP = MAX_HP;
  enemyHP = MAX_HP;
  playerComboCount = 0;
  totalCombosAchieved = 0;
  totalTurns = 0;
  surpriseEffect = null;
  isTurnInProgress = false;
  isBattleOver = false;

  // Atualiza as interfaces dos dois Pokémon
  setupCombatantUI("player", playerPokemon, playerHP);
  setupCombatantUI("enemy", enemyPokemon, enemyHP);

  // Limpa e inicializa o histórico de combate
  DOM.battleLog.innerHTML = "";
  addLogMessage(`⚡ A batalha começou! Você escolheu ${playerPokemon.name} para enfrentar ${enemyPokemon.name}!`, "log-system");
  addLogMessage(`Dica: Acerte 3 ataques seguidos para ativar o bônus de COMBO!`, "log-special");

  // Esconde alertas e badges temporárias
  hideCriticalAlert();
  updateComboUI();
  hideSurpriseBadge();
  DOM.resultModal.classList.add("hidden");
  DOM.resultModal.style.display = "none";

  // Alterna as telas: Oculta seleção e exibe arena de combate
  DOM.selectionScreen.classList.add("hidden");
  DOM.selectionScreen.style.display = "none";
  DOM.battleScreen.classList.remove("hidden");
  DOM.battleScreen.style.display = "block";

  enableAttackButtons(true);

  DOM.turnIndicator.textContent = "Sua Vez de Atacar!";
  DOM.turnIndicator.style.color = "#38bdf8";
}

/**
 * Preenche os cards de status e sprites de cada lado
 */
function setupCombatantUI(side, pokemon, hp) {
  if (side === "player") {
    DOM.playerName.textContent = pokemon.name;
    DOM.playerTypeBadge.className = `type-badge ${pokemon.typeClass}`;
    DOM.playerTypeBadge.innerHTML = `${pokemon.badgeIcon} ${pokemon.type}`;
    DOM.playerFeature.textContent = pokemon.characteristic;
    DOM.playerSprite.src = pokemon.image;
    DOM.playerSprite.alt = pokemon.name;
    updateHPBar("player", hp);
  } else {
    DOM.enemyName.textContent = pokemon.name;
    DOM.enemyTypeBadge.className = `type-badge ${pokemon.typeClass}`;
    DOM.enemyTypeBadge.innerHTML = `${pokemon.badgeIcon} ${pokemon.type}`;
    DOM.enemyFeature.textContent = pokemon.characteristic;
    DOM.enemySprite.src = pokemon.image;
    DOM.enemySprite.alt = pokemon.name;
    updateHPBar("enemy", hp);
  }
}

// ==========================================
// 7. SISTEMA DE HP E MOMENTO CRÍTICO
// ==========================================
function updateHPBar(side, currentHP) {
  const hpPercent = Math.max(0, Math.min(100, (currentHP / MAX_HP) * 100));
  const hpText = `${Math.ceil(currentHP)} / ${MAX_HP} HP`;

  let barElement = side === "player" ? DOM.playerHPBar : DOM.enemyHPBar;
  let textElement = side === "player" ? DOM.playerHPText : DOM.enemyHPText;

  textElement.textContent = hpText;
  barElement.style.width = `${hpPercent}%`;

  // Remove classes anteriores
  barElement.classList.remove("medium", "danger");

  if (hpPercent <= 30) {
    barElement.classList.add("danger");
  } else if (hpPercent <= 55) {
    barElement.classList.add("medium");
  }

  // Verifica o Momento Crítico (< 30% HP)
  checkCriticalMoment();
}

/**
 * DIFERENCIAL 1 — MOMENTO CRÍTICO
 * Se o HP do jogador for inferior a 30%, ativa alerta visual e destaca o Ataque Especial
 */
function checkCriticalMoment() {
  const isPlayerCritical = playerHP <= 30 && playerHP > 0;

  if (isPlayerCritical) {
    DOM.criticalAlert.classList.remove("hidden");
    DOM.btnSpecial.classList.add("critical-highlight");
  } else {
    hideCriticalAlert();
  }
}

function hideCriticalAlert() {
  DOM.criticalAlert.classList.add("hidden");
  DOM.btnSpecial.classList.remove("critical-highlight");
}

// ==========================================
// 8. EXECUÇÃO DE ATAQUES DO JOGADOR
// ==========================================
function handlePlayerAttack(attackType) {
  if (isTurnInProgress || isBattleOver) return;

  isTurnInProgress = true;
  enableAttackButtons(false);
  totalTurns++;

  DOM.turnIndicator.textContent = `${playerPokemon.name} está atacando...`;
  DOM.turnIndicator.style.color = "#fbbf24";

  // Sons
  if (attackType === "special") {
    SoundFX.special();
  } else {
    SoundFX.attack();
  }

  // Animação de investida do jogador
  DOM.playerSprite.classList.add("anim-player-attack");

  setTimeout(() => {
    DOM.playerSprite.classList.remove("anim-player-attack");

    // Cálculo do dano causado pelo Jogador
    const damageResult = calculateDamage("player", attackType);

    // Aplica o dano no adversário
    enemyHP = Math.max(0, enemyHP - damageResult.finalDamage);
    SoundFX.hit();

    // Animação de impacto no adversário
    DOM.enemySprite.classList.add("anim-hit");
    setTimeout(() => DOM.enemySprite.classList.remove("anim-hit"), 450);

    // Número flutuante de dano
    showFloatingText(
      DOM.enemyDamageContainer,
      `-${damageResult.finalDamage} HP`,
      damageResult.isCrit ? "crit" : "normal"
    );

    // Atualiza a barra de vida
    updateHPBar("enemy", enemyHP);

    // Registro no Log de Combate
    let logMsg = `⚔️ ${playerPokemon.name} usou ${getAttackName(attackType)} e causou ${damageResult.finalDamage} de dano!`;
    if (damageResult.isCrit) logMsg += ` 💥 ATAQUE CRÍTICO!`;
    if (damageResult.comboBonus) logMsg += ` 🔥 Bônus de Combo ativado!`;
    addLogMessage(logMsg, "log-player");

    // Passiva do Venusaur: Recuperação de HP ao atacar
    if (playerPokemon.passiveId === "heal" && playerHP > 0 && playerHP < MAX_HP) {
      const healAmount = 10;
      playerHP = Math.min(MAX_HP, playerHP + healAmount);
      updateHPBar("player", playerHP);
      SoundFX.heal();
      showFloatingText(DOM.playerDamageContainer, `+${healAmount} HP`, "heal");
      addLogMessage(`🌿 Habilidade do Venusaur: Recuperou +${healAmount} HP!`, "log-special");
    }

    // DIFERENCIAL 2: Progresso do Combo do Jogador
    advanceCombo();

    // Passiva do Pikachu: Chance de Golpe Duplo Imediato
    if (playerPokemon.passiveId === "speed" && Math.random() < 0.35 && enemyHP > 0) {
      setTimeout(() => {
        const extraDamage = Math.floor(Math.random() * 8) + 8;
        enemyHP = Math.max(0, enemyHP - extraDamage);
        updateHPBar("enemy", enemyHP);
        showFloatingText(DOM.enemyDamageContainer, `-${extraDamage} HP`, "normal");
        addLogMessage(`⚡ Agilidade do Pikachu! Realizou um segundo golpe surpresa causando ${extraDamage} de dano!`, "log-special");
      }, 500);
    }

    // Limpa efeitos temporários usados
    surpriseEffect = null;
    hideSurpriseBadge();

    // Verifica se o adversário foi derrotado
    if (enemyHP <= 0) {
      setTimeout(() => endGame(true), 600);
      return;
    }

    // Turno do Adversário após breve pausa
    setTimeout(() => {
      triggerEnemyTurn();
    }, 1000);

  }, 350);
}

// ==========================================
// 9. TURNO DO ADVERSÁRIO (IA SIMPLES)
// ==========================================
function triggerEnemyTurn() {
  if (isBattleOver) return;

  DOM.turnIndicator.textContent = `Vez de ${enemyPokemon.name}!`;
  DOM.turnIndicator.style.color = "#f87171";

  // Escolha aleatória de golpe da IA
  const randChoice = Math.random();
  let enemyAttackType = "quick";
  if (randChoice > 0.65) {
    enemyAttackType = "special";
  } else if (randChoice > 0.35) {
    enemyAttackType = "strong";
  }

  // Sons
  if (enemyAttackType === "special") {
    SoundFX.special();
  } else {
    SoundFX.attack();
  }

  // Animação de investida do adversário
  DOM.enemySprite.classList.add("anim-enemy-attack");

  setTimeout(() => {
    DOM.enemySprite.classList.remove("anim-enemy-attack");

    // Cálculo do dano do adversário
    const damageResult = calculateDamage("enemy", enemyAttackType);

    // Aplica o dano no jogador
    playerHP = Math.max(0, playerHP - damageResult.finalDamage);
    SoundFX.hit();

    // Animação de impacto no jogador
    DOM.playerSprite.classList.add("anim-hit");
    setTimeout(() => DOM.playerSprite.classList.remove("anim-hit"), 450);

    // Número flutuante de dano
    showFloatingText(
      DOM.playerDamageContainer,
      `-${damageResult.finalDamage} HP`,
      damageResult.isCrit ? "crit" : "normal"
    );

    // Atualiza barra de vida
    updateHPBar("player", playerHP);

    // Log de Combate
    let logMsg = `💥 ${enemyPokemon.name} revidou com ${getAttackName(enemyAttackType)} e causou ${damageResult.finalDamage} de dano!`;
    if (damageResult.isCrit) logMsg += ` ⚠️ Acerto Crítico do inimigo!`;
    addLogMessage(logMsg, "log-enemy");

    // Passiva do Venusaur Adversário
    if (enemyPokemon.passiveId === "heal" && enemyHP > 0 && enemyHP < MAX_HP) {
      const healAmount = 10;
      enemyHP = Math.min(MAX_HP, enemyHP + healAmount);
      updateHPBar("enemy", enemyHP);
      showFloatingText(DOM.enemyDamageContainer, `+${healAmount} HP`, "heal");
    }

    // Verifica se o jogador foi derrotado
    if (playerHP <= 0) {
      setTimeout(() => endGame(false), 600);
      return;
    }

    // Fim da rodada: Possibilidade de EVENTO SURPRESA antes da próxima ação
    checkSurpriseEvent();

    // Devolve o controle ao jogador
    DOM.turnIndicator.textContent = "Sua Vez de Atacar!";
    DOM.turnIndicator.style.color = "#38bdf8";
    isTurnInProgress = false;
    enableAttackButtons(true);

  }, 350);
}

// ==========================================
// 10. CÁLCULO DE DANO & APLICAÇÃO DE DIFERENCIAIS
// ==========================================
function calculateDamage(attackerSide, attackType) {
  const attacker = attackerSide === "player" ? playerPokemon : enemyPokemon;
  const defender = attackerSide === "player" ? enemyPokemon : playerPokemon;

  // Dano base por tipo de golpe
  let baseDamage = 0;
  if (attackType === "quick") {
    baseDamage = Math.floor(Math.random() * 7) + 12; // 12 a 18
  } else if (attackType === "strong") {
    baseDamage = Math.floor(Math.random() * 11) + 20; // 20 a 30
  } else if (attackType === "special") {
    baseDamage = Math.floor(Math.random() * 13) + 32; // 32 a 44
  }

  // --- HABILIDADES PASSIVAS ---
  // Charizard: +15% de Dano contínuo
  if (attacker.passiveId === "power") {
    baseDamage = Math.round(baseDamage * 1.15);
  }

  // Lucario: Dano equilibrado (garante mínimo de 18 no rápido, 26 no forte e 38 no especial)
  if (attacker.passiveId === "balanced") {
    if (attackType === "quick") baseDamage = Math.max(16, baseDamage);
    if (attackType === "strong") baseDamage = Math.max(25, baseDamage);
    if (attackType === "special") baseDamage = Math.max(38, baseDamage);
  }

  // Greninja: Bônus no Ataque Rápido
  if (attacker.passiveId === "fast" && attackType === "quick") {
    baseDamage = Math.round(baseDamage * 1.25);
  }

  // Mewtwo: Ataque especial amplificado (+30%)
  if (attacker.passiveId === "special" && attackType === "special") {
    baseDamage = Math.round(baseDamage * 1.30);
  }

  // Blastoise (Defensor): Reduz dano sofrido em 20%
  if (defender.passiveId === "defense") {
    baseDamage = Math.round(baseDamage * 0.80);
  }

  // --- BÔNUS DE MOMENTO CRÍTICO DO JOGADOR (<30% HP) ---
  if (attackerSide === "player" && playerHP <= 30 && attackType === "special") {
    baseDamage = Math.round(baseDamage * 1.25);
  }

  // --- DIFERENCIAL 2: BÔNUS DE COMBO X3 ---
  let comboBonus = false;
  if (attackerSide === "player" && playerComboCount >= 3) {
    baseDamage = Math.round(baseDamage * 1.25);
    comboBonus = true;
    playerComboCount = 0; // Consome o combo x3
    updateComboUI();
  }

  // --- DIFERENCIAL 3: EVENTOS SURPRESA APLICADOS ---
  if (attackerSide === "player") {
    if (surpriseEffect === "dmg_buff") {
      baseDamage += 8;
    }
  } else {
    // Se o jogador estiver com defesa aumentada
    if (surpriseEffect === "defense_buff") {
      baseDamage = Math.round(baseDamage * 0.5);
    }
  }

  // --- CHANCE DE CRÍTICO ---
  let isCrit = false;
  let critChance = attacker.passiveId === "crit" ? 0.35 : 0.12; // Gengar tem 35% de chance
  if (attackerSide === "player" && surpriseEffect === "crit_guaranteed") {
    critChance = 1.0; // 100% de chance garantida pelo evento surpresa
  }

  if (Math.random() < critChance) {
    isCrit = true;
    baseDamage = Math.round(baseDamage * 1.7);
  }

  return {
    finalDamage: Math.max(1, baseDamage),
    isCrit,
    comboBonus
  };
}

// ==========================================
// 11. DIFERENCIAL 2 — SISTEMA DE COMBO
// ==========================================
function advanceCombo() {
  playerComboCount++;

  if (playerComboCount === 3) {
    totalCombosAchieved++;
    addLogMessage(`🔥 COMBO x3! Seu próximo ataque causará +25% de dano extra!`, "log-special");
  }

  updateComboUI();
}

function updateComboUI() {
  if (playerComboCount >= 3) {
    DOM.comboBadge.classList.remove("hidden");
    DOM.comboText.textContent = `COMBO x3!`;
  } else if (playerComboCount > 0) {
    DOM.comboBadge.classList.remove("hidden");
    DOM.comboText.textContent = `COMBO x${playerComboCount}`;
  } else {
    DOM.comboBadge.classList.add("hidden");
  }
}

// ==========================================
// 12. DIFERENCIAL 3 — EVENTOS SURPRESA
// ==========================================
function checkSurpriseEvent() {
  // Chance de 25% de disparar um evento a cada rodada
  if (Math.random() > 0.25 || isBattleOver) return;

  const eventTypes = [
    {
      id: "heal",
      text: "⚡ Energia encontrada! +10 HP recuperado!",
      apply: () => {
        playerHP = Math.min(MAX_HP, playerHP + 10);
        updateHPBar("player", playerHP);
        showFloatingText(DOM.playerDamageContainer, "+10 HP", "heal");
        SoundFX.heal();
      }
    },
    {
      id: "crit_guaranteed",
      text: "🔥 Foco Implacável! Seu próximo ataque será Crítico!",
      apply: () => {
        surpriseEffect = "crit_guaranteed";
      }
    },
    {
      id: "defense_buff",
      text: "🛡️ Defesa aumentada! Próximo dano inimigo reduzido pela metade!",
      apply: () => {
        surpriseEffect = "defense_buff";
      }
    },
    {
      id: "dmg_buff",
      text: "💥 Ataque fortalecido! +8 de dano no próximo golpe!",
      apply: () => {
        surpriseEffect = "dmg_buff";
      }
    }
  ];

  const chosenEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  chosenEvent.apply();

  // Exibe o badge na tela e a mensagem no log
  showSurpriseBadge(chosenEvent.text);
  addLogMessage(`🎲 EVENTO SURPRESA: ${chosenEvent.text}`, "log-special");
}

function showSurpriseBadge(text) {
  DOM.surpriseBadge.classList.remove("hidden");
  DOM.surpriseText.textContent = text;

  setTimeout(() => {
    hideSurpriseBadge();
  }, 4000);
}

function hideSurpriseBadge() {
  DOM.surpriseBadge.classList.add("hidden");
}

// ==========================================
// 13. NÚMEROS FLUTUANTES DE DANO / CURA
// ==========================================
function showFloatingText(container, text, type = "normal") {
  const popup = document.createElement("span");
  popup.className = `damage-popup ${type}`;
  popup.textContent = text;
  container.appendChild(popup);

  // Remove do DOM após o término da animação
  setTimeout(() => {
    popup.remove();
  }, 1200);
}

// ==========================================
// 14. LOG DE BATALHA
// ==========================================
function addLogMessage(message, className = "log-player") {
  const p = document.createElement("p");
  p.className = `log-entry ${className}`;
  p.innerHTML = message;
  DOM.battleLog.appendChild(p);

  // Rolagem automática para a mensagem mais recente
  DOM.battleLog.scrollTop = DOM.battleLog.scrollHeight;
}

function getAttackName(type) {
  switch (type) {
    case "quick": return "Ataque Rápido ⚡";
    case "strong": return "Ataque Forte 💥";
    case "special": return "Ataque Especial 🔥";
    default: return "Ataque";
  }
}

function enableAttackButtons(enabled) {
  DOM.btnQuick.disabled = !enabled;
  DOM.btnStrong.disabled = !enabled;
  DOM.btnSpecial.disabled = !enabled;
}

// ==========================================
// 15. FINAL DA BATALHA & REINÍCIO
// ==========================================
function endGame(isVictory) {
  isBattleOver = true;
  enableAttackButtons(false);
  hideCriticalAlert();

  DOM.modalCard.classList.remove("victory", "defeat");

  if (isVictory) {
    SoundFX.victory();
    DOM.modalCard.classList.add("victory");
    DOM.modalIcon.textContent = "🏆";
    DOM.modalTitle.textContent = "VITÓRIA!";
    DOM.modalDesc.textContent = `${playerPokemon.name} venceu a batalha contra ${enemyPokemon.name}!`;
    addLogMessage(`🏆 Fim de batalha: ${playerPokemon.name} é o grande campeão!`, "log-special");
  } else {
    SoundFX.defeat();
    DOM.modalCard.classList.add("defeat");
    DOM.modalIcon.textContent = "💀";
    DOM.modalTitle.textContent = "DERROTA!";
    DOM.modalDesc.textContent = `${enemyPokemon.name} venceu a batalha... Tente novamente!`;
    addLogMessage(`💀 Fim de batalha: ${enemyPokemon.name} venceu este confronto.`, "log-enemy");
  }

  // Estatísticas resumidas da partida
  DOM.statTurns.textContent = `${totalTurns} turnos`;
  DOM.statCombos.textContent = `${totalCombosAchieved}`;

  DOM.resultModal.classList.remove("hidden");
  DOM.resultModal.style.display = "flex";
}

function resetGameToSelection() {
  // Esconde o modal e a arena, e reabre a tela de escolha de Pokémon
  DOM.resultModal.classList.add("hidden");
  DOM.resultModal.style.display = "none";
  DOM.battleScreen.classList.add("hidden");
  DOM.battleScreen.style.display = "none";
  DOM.selectionScreen.classList.remove("hidden");
  DOM.selectionScreen.style.display = "block";

  // Rola suavemente até o topo da tela
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// ==========================================
// 16. CONFIGURAÇÃO DE EVENTOS DE BOTÕES
// ==========================================
function setupEventListeners() {
  // Botões de Ataque
  DOM.btnQuick.addEventListener("click", () => handlePlayerAttack("quick"));
  DOM.btnStrong.addEventListener("click", () => handlePlayerAttack("strong"));
  DOM.btnSpecial.addEventListener("click", () => handlePlayerAttack("special"));

  // Botão Voltar para Seleção
  DOM.btnBackSelect.addEventListener("click", () => {
    if (confirm("Deseja sair da batalha atual e voltar para a seleção?")) {
      resetGameToSelection();
    }
  });

  // Botão Jogar Novamente
  DOM.btnPlayAgain.addEventListener("click", () => {
    resetGameToSelection();
  });
}

// Inicia a aplicação após o carregamento do DOM
document.addEventListener("DOMContentLoaded", initApp);
