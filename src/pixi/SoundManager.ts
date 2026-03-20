class SoundManagerClass {
  private _sounds: Map<string, HTMLAudioElement> = new Map();
  private _pools: Map<string, HTMLAudioElement[]> = new Map();
  private _bgMusic: HTMLAudioElement | null = null;
  private _muted: boolean = false;

  preload() {
    const files: Record<string, string> = {
      spin: 'assets/snd/spin.ogg',
      reel: 'assets/snd/reel.ogg',
      win: 'assets/snd/win.ogg',
      click: 'assets/snd/click.ogg',
      bg_music: 'assets/snd/bg_music.ogg',
    };

    for (const [name, url] of Object.entries(files)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this._sounds.set(name, audio);
      this._pools.set(name, []);
    }
  }

  play(name: string, volume: number = 1.0) {
    if (this._muted) return;
    const source = this._sounds.get(name);
    if (!source) return;

    const pool = this._pools.get(name)!;
    let audio = pool.find(a => a.ended || a.paused);
    if (!audio) {
      if (pool.length >= 4) return;
      audio = source.cloneNode(true) as HTMLAudioElement;
      pool.push(audio);
    }
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(() => {});
  }

  startBgMusic() {
    if (this._bgMusic) return;
    const audio = this._sounds.get('bg_music');
    if (!audio) return;
    this._bgMusic = audio;
    this._bgMusic.loop = true;
    this._bgMusic.volume = 0.3;
    this._bgMusic.play().catch(() => {});
  }

  stopBgMusic() {
    if (this._bgMusic) {
      this._bgMusic.pause();
      this._bgMusic.currentTime = 0;
      this._bgMusic = null;
    }
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    if (this._bgMusic) {
      this._bgMusic.volume = muted ? 0 : 0.3;
    }
  }
}

export const SoundManager = new SoundManagerClass();
