import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://gjrofevnjsxvftlgsqvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqcm9mZXZuanN4dmZ0bGdzcXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTk3NDQsImV4cCI6MjA3OTg5NTc0NH0.ipVAH38O7X_j-zZpaTxJ9jYSjOAVvmRpX2QxHVf1KXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class AdminApp {
  constructor() {
    this.currentView = 'login';
    this.currentUser = null;
    this.games = [];
    this.categories = [];
    this.init();
  }

  async init() {
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      this.currentUser = session.data.session.user;
      this.currentView = 'dashboard';
      await this.loadData();
    }
    this.render();
  }

  async loadData() {
    await Promise.all([
      this.loadGames(),
      this.loadCategories()
    ]);
  }

  async loadGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (!error) {
      this.games = data || [];
    }
  }

  async loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (!error) {
      this.categories = data || [];
    }
  }

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    this.currentUser = data.user;
    this.currentView = 'dashboard';
    await this.loadData();
    this.render();
  }

  async logout() {
    await supabase.auth.signOut();
    this.currentUser = null;
    this.currentView = 'login';
    this.render();
  }

  navigateTo(view) {
    this.currentView = view;
    this.render();
  }

  render() {
    const app = document.getElementById('app');

    if (this.currentView === 'login') {
      app.innerHTML = this.renderLogin();
      this.attachLoginHandlers();
    } else {
      app.innerHTML = this.renderAdmin();
      this.attachAdminHandlers();
    }
  }

  renderLogin() {
    return `
      <div class="login-container">
        <div class="login-card">
          <h1 class="login-title">Admin Panel</h1>
          <p class="login-subtitle">Sign in to manage games</p>
          <div id="login-error" class="error-message hidden"></div>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn" id="login-btn">
              <span id="login-text">Sign In</span>
              <span id="login-loading" class="loading hidden"></span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  renderAdmin() {
    const content = {
      dashboard: this.renderDashboard(),
      games: this.renderGames(),
      categories: this.renderCategories()
    };

    return `
      <div class="admin-layout">
        <aside class="sidebar">
          <div class="sidebar-brand">🎮 Mini Games</div>
          <nav>
            <div class="nav-item ${this.currentView === 'dashboard' ? 'active' : ''}" onclick="app.navigateTo('dashboard')">
              📊 Dashboard
            </div>
            <div class="nav-item ${this.currentView === 'games' ? 'active' : ''}" onclick="app.navigateTo('games')">
              🎯 Games
            </div>
            <div class="nav-item ${this.currentView === 'categories' ? 'active' : ''}" onclick="app.navigateTo('categories')">
              📁 Categories
            </div>
          </nav>
        </aside>
        <main class="main-content">
          ${content[this.currentView] || content.dashboard}
        </main>
      </div>
      ${this.renderModals()}
    `;
  }

  renderDashboard() {
    const totalGames = this.games.length;
    const publishedGames = this.games.filter(g => g.status === 'published').length;
    const draftGames = this.games.filter(g => g.status === 'draft').length;
    const totalPlays = this.games.reduce((sum, g) => sum + (g.play_count || 0), 0);

    return `
      <div class="header">
        <h1 class="page-title">Dashboard</h1>
        <button class="btn-logout" onclick="app.logout()">Logout</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Games</div>
          <div class="stat-value">${totalGames}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Published</div>
          <div class="stat-value">${publishedGames}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Drafts</div>
          <div class="stat-value">${draftGames}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Plays</div>
          <div class="stat-value">${totalPlays.toLocaleString()}</div>
        </div>
      </div>

      <div class="card">
        <h2 style="margin-bottom: 16px;">Recent Games</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Category</th>
                <th>Status</th>
                <th>Plays</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              ${this.games.slice(0, 10).map(game => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${game.thumbnail_url}" alt="${game.title}" class="thumbnail">
                      <strong>${game.title}</strong>
                    </div>
                  </td>
                  <td>${game.category?.name || 'N/A'}</td>
                  <td><span class="badge badge-${game.status || 'published'}">${game.status || 'published'}</span></td>
                  <td>${game.play_count || 0}</td>
                  <td>⭐ ${(game.rating || 0).toFixed(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderGames() {
    return `
      <div class="header">
        <h1 class="page-title">Games</h1>
        <div style="display: flex; gap: 12px; align-items: center;">
          <button class="btn-primary" onclick="app.openGameModal()">➕ Add Game</button>
          <button class="btn-logout" onclick="app.logout()">Logout</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Category</th>
                <th>Status</th>
                <th>Plays</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.games.map(game => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${game.thumbnail_url}" alt="${game.title}" class="thumbnail">
                      <div>
                        <strong>${game.title}</strong>
                        ${game.is_featured ? '<br><span style="font-size: 12px; color: #FBBF24;">⭐ Featured</span>' : ''}
                      </div>
                    </div>
                  </td>
                  <td>${game.category?.name || 'N/A'}</td>
                  <td><span class="badge badge-${game.status || 'published'}">${game.status || 'published'}</span></td>
                  <td>${game.play_count || 0}</td>
                  <td>⭐ ${(game.rating || 0).toFixed(1)}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon" onclick="app.editGame('${game.id}')" title="Edit">✏️</button>
                      <button class="btn-icon" onclick="app.previewGame('${game.id}')" title="Preview">👁️</button>
                      <button class="btn-icon btn-danger" onclick="app.deleteGame('${game.id}')" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderCategories() {
    return `
      <div class="header">
        <h1 class="page-title">Categories</h1>
        <div style="display: flex; gap: 12px; align-items: center;">
          <button class="btn-primary" onclick="app.openCategoryModal()">➕ Add Category</button>
          <button class="btn-logout" onclick="app.logout()">Logout</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Games Count</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.categories.map(category => {
                const gameCount = this.games.filter(g => g.category_id === category.id).length;
                return `
                  <tr>
                    <td style="font-size: 32px;">${category.icon}</td>
                    <td><strong>${category.name}</strong></td>
                    <td>${gameCount} games</td>
                    <td>${category.order || 0}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn-icon" onclick="app.editCategory('${category.id}')" title="Edit">✏️</button>
                        <button class="btn-icon btn-danger" onclick="app.deleteCategory('${category.id}')" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderModals() {
    return `
      <div id="game-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="game-modal-title">Add New Game</h2>
            <button class="btn-close" onclick="app.closeGameModal()">×</button>
          </div>
          <div id="game-form-error" class="error-message hidden"></div>
          <div id="game-form-success" class="success-message hidden"></div>
          <form id="game-form">
            <input type="hidden" id="game-id" name="id">

            <div class="form-group">
              <label for="game-title">Title *</label>
              <input type="text" id="game-title" name="title" required>
            </div>

            <div class="form-group">
              <label for="game-description">Description</label>
              <textarea id="game-description" name="description"></textarea>
            </div>

            <div class="form-group">
              <label for="game-category">Category *</label>
              <select id="game-category" name="category_id" required>
                <option value="">Select a category</option>
                ${this.categories.map(cat => `
                  <option value="${cat.id}">${cat.icon} ${cat.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="game-thumbnail">Thumbnail URL *</label>
              <input type="url" id="game-thumbnail" name="thumbnail_url" required>
            </div>

            <div class="form-group">
              <label for="game-url">Game URL *</label>
              <input type="url" id="game-url" name="game_url" required>
              <small style="color: #94A3B8; font-size: 14px;">Enter the URL where the game is hosted</small>
            </div>

            <div class="form-group">
              <label for="game-rating">Rating (0-5)</label>
              <input type="number" id="game-rating" name="rating" min="0" max="5" step="0.1" value="4.5">
            </div>

            <div class="form-group">
              <label for="game-status">Status</label>
              <select id="game-status" name="status">
                <option value="draft">Draft</option>
                <option value="published" selected>Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" id="game-featured" name="is_featured" style="width: auto; margin-right: 8px;">
                Featured Game
              </label>
            </div>

            <button type="submit" class="btn" id="game-submit-btn">
              <span id="game-submit-text">Save Game</span>
              <span id="game-submit-loading" class="loading hidden"></span>
            </button>
          </form>
        </div>
      </div>

      <div id="category-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="category-modal-title">Add New Category</h2>
            <button class="btn-close" onclick="app.closeCategoryModal()">×</button>
          </div>
          <div id="category-form-error" class="error-message hidden"></div>
          <div id="category-form-success" class="success-message hidden"></div>
          <form id="category-form">
            <input type="hidden" id="category-id" name="id">

            <div class="form-group">
              <label for="category-name">Name *</label>
              <input type="text" id="category-name" name="name" required>
            </div>

            <div class="form-group">
              <label for="category-icon">Icon (Emoji) *</label>
              <input type="text" id="category-icon" name="icon" required placeholder="🎮">
            </div>

            <div class="form-group">
              <label for="category-order">Order</label>
              <input type="number" id="category-order" name="order" value="0">
            </div>

            <button type="submit" class="btn" id="category-submit-btn">
              <span id="category-submit-text">Save Category</span>
              <span id="category-submit-loading" class="loading hidden"></span>
            </button>
          </form>
        </div>
      </div>

      <div id="preview-modal" class="modal">
        <div class="modal-content" style="max-width: 1200px; padding: 0;">
          <div style="padding: 32px; padding-bottom: 0;">
            <div class="modal-header" style="margin-bottom: 0;">
              <h2 class="modal-title" id="preview-modal-title">Game Preview</h2>
              <button class="btn-close" onclick="app.closePreviewModal()">×</button>
            </div>
          </div>
          <div style="padding: 24px;">
            <iframe id="preview-iframe" style="width: 100%; height: 600px; border: none; border-radius: 12px; background: white;"></iframe>
          </div>
        </div>
      </div>
    `;
  }

  attachLoginHandlers() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('login-btn');
      const text = document.getElementById('login-text');
      const loading = document.getElementById('login-loading');
      const errorDiv = document.getElementById('login-error');

      btn.disabled = true;
      text.classList.add('hidden');
      loading.classList.remove('hidden');
      errorDiv.classList.add('hidden');

      try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await this.login(email, password);
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        btn.disabled = false;
        text.classList.remove('hidden');
        loading.classList.add('hidden');
      }
    });
  }

  attachAdminHandlers() {
    const gameForm = document.getElementById('game-form');
    if (gameForm) {
      gameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveGame(new FormData(e.target));
      });
    }

    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
      categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveCategory(new FormData(e.target));
      });
    }
  }

  openGameModal(gameId = null) {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('game-modal-title');
    const form = document.getElementById('game-form');

    form.reset();
    document.getElementById('game-form-error').classList.add('hidden');
    document.getElementById('game-form-success').classList.add('hidden');

    if (gameId) {
      const game = this.games.find(g => g.id === gameId);
      if (game) {
        title.textContent = 'Edit Game';
        document.getElementById('game-id').value = game.id;
        document.getElementById('game-title').value = game.title;
        document.getElementById('game-description').value = game.description || '';
        document.getElementById('game-category').value = game.category_id;
        document.getElementById('game-thumbnail').value = game.thumbnail_url;
        document.getElementById('game-url').value = game.game_url;
        document.getElementById('game-rating').value = game.rating || 4.5;
        document.getElementById('game-status').value = game.status || 'published';
        document.getElementById('game-featured').checked = game.is_featured || false;
      }
    } else {
      title.textContent = 'Add New Game';
    }

    modal.classList.add('active');
  }

  closeGameModal() {
    document.getElementById('game-modal').classList.remove('active');
  }

  async saveGame(formData) {
    const btn = document.getElementById('game-submit-btn');
    const text = document.getElementById('game-submit-text');
    const loading = document.getElementById('game-submit-loading');
    const errorDiv = document.getElementById('game-form-error');
    const successDiv = document.getElementById('game-form-success');

    btn.disabled = true;
    text.classList.add('hidden');
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    try {
      const gameData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category_id: formData.get('category_id'),
        thumbnail_url: formData.get('thumbnail_url'),
        game_url: formData.get('game_url'),
        rating: parseFloat(formData.get('rating')),
        status: formData.get('status'),
        is_featured: document.getElementById('game-featured').checked
      };

      const gameId = formData.get('id');

      if (gameId) {
        const { error } = await supabase
          .from('games')
          .update(gameData)
          .eq('id', gameId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('games')
          .insert([gameData]);

        if (error) throw error;
      }

      successDiv.textContent = 'Game saved successfully!';
      successDiv.classList.remove('hidden');

      await this.loadGames();

      setTimeout(() => {
        this.closeGameModal();
        this.render();
      }, 1000);

    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      text.classList.remove('hidden');
      loading.classList.add('hidden');
    }
  }

  editGame(gameId) {
    this.openGameModal(gameId);
  }

  async deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;

      await this.loadGames();
      this.render();
    } catch (error) {
      alert('Error deleting game: ' + error.message);
    }
  }

  previewGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    const modal = document.getElementById('preview-modal');
    const iframe = document.getElementById('preview-iframe');
    const title = document.getElementById('preview-modal-title');

    title.textContent = game.title;
    iframe.src = game.game_url;
    modal.classList.add('active');
  }

  closePreviewModal() {
    const modal = document.getElementById('preview-modal');
    const iframe = document.getElementById('preview-iframe');
    iframe.src = '';
    modal.classList.remove('active');
  }

  openCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const form = document.getElementById('category-form');

    form.reset();
    document.getElementById('category-form-error').classList.add('hidden');
    document.getElementById('category-form-success').classList.add('hidden');

    if (categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        title.textContent = 'Edit Category';
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-icon').value = category.icon;
        document.getElementById('category-order').value = category.order || 0;
      }
    } else {
      title.textContent = 'Add New Category';
    }

    modal.classList.add('active');
  }

  closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
  }

  async saveCategory(formData) {
    const btn = document.getElementById('category-submit-btn');
    const text = document.getElementById('category-submit-text');
    const loading = document.getElementById('category-submit-loading');
    const errorDiv = document.getElementById('category-form-error');
    const successDiv = document.getElementById('category-form-success');

    btn.disabled = true;
    text.classList.add('hidden');
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    try {
      const categoryData = {
        name: formData.get('name'),
        icon: formData.get('icon'),
        order: parseInt(formData.get('order')) || 0
      };

      const categoryId = formData.get('id');

      if (categoryId) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', categoryId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
      }

      successDiv.textContent = 'Category saved successfully!';
      successDiv.classList.remove('hidden');

      await this.loadCategories();

      setTimeout(() => {
        this.closeCategoryModal();
        this.render();
      }, 1000);

    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      text.classList.remove('hidden');
      loading.classList.add('hidden');
    }
  }

  editCategory(categoryId) {
    this.openCategoryModal(categoryId);
  }

  async deleteCategory(categoryId) {
    const gameCount = this.games.filter(g => g.category_id === categoryId).length;

    if (gameCount > 0) {
      alert(`Cannot delete category with ${gameCount} games. Please reassign or delete the games first.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      await this.loadCategories();
      this.render();
    } catch (error) {
      alert('Error deleting category: ' + error.message);
    }
  }
}

window.app = new AdminApp();
