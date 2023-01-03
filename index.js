// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import axios from 'axios';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='github-finder'>
    <h2 class='title'>Github User Profile</h2>

    <div class='main'>
      <form data-form=''>
        <label>
          <input type='text' name='query' placeholder='Enter username'>
        </label>
        <button>Submit</button>
      </form>
      <div class='user-result hide' data-user=''></div>
      <div class='repos-result hide' data-repos=''></div>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      form: document.querySelector('[data-form]'),
      user: document.querySelector('[data-user]'),
      repos: document.querySelector('[data-repos]'),
    };

    this.PROPS = {
      axios: axios.create({
        baseURL: 'https://api.github.com',
        headers: { Authorization: 'token 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' },
      }),
    };

    this.DOM.form.addEventListener('submit', this.onSubmit);
  }

  /**
   * @function submitHandler - Form submit handler
   * @param event
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const query = Object.fromEntries(new FormData(form).entries()).query.trim();

    if (query.length === 0) {
      showNotification('warning', 'Please fill the field.');
      return;
    }

    try {
      form.querySelector('button').textContent = 'Loading...';

      const [user, repos] = await Promise.all([
        this.PROPS.axios.get(`/users/${query}`),
        this.PROPS.axios.get(`/users/${query}/repos?sort=created&per_page=10`),
      ]);

      this.renderUser(user);
      this.renderRepos(repos);

      form.querySelector('button').textContent = 'Submit';

    } catch (e) {
      showNotification('warning', 'User not found');
      form.querySelector('button').textContent = 'Submit';
      form.reset();
      return;
    }

  };

  /**
   * @function renderUser - Render user data HTML
   * @param data
   */
  renderUser = ({ data: { login, html_url, avatar_url, followers, following, public_gists, public_repos, bio } }) => {
    this.DOM.user.classList.remove('hide');
    return this.DOM.user.innerHTML = `
        <h3 class='h4'>About <span>${login}</span></h3>
        <div class='top'>
          <img src='${avatar_url}' alt='${login}'>
          <a class='button' href='${html_url}' target='_blank'>View Profile</a>
          <div>${bio !== null ? bio : ''}</div>
          <ul>
            <li class='followers'>Followers: ${followers}</li>
            <li class='following'>Following: ${following}</li>
            <li class='repos'>Public Repos: ${public_repos}</li>
            <li class='gists'>Public Gists: ${public_gists}</li>
          </ul>
        </div>`;
  };

  /**
   * @function renderRepos - Render repos data HTML
   * @param data
   */
  renderRepos = ({ data }) => {
    this.DOM.repos.classList.remove('hide');
    return this.DOM.repos.innerHTML = data.length === 0 ? '' : `
      <h3 class='h4'>Latest Repos:</h3>
      <ul>
        ${data.map(({ html_url, name, stargazers_count, watchers_count, forks_count }) => `
          <li>
            <a target='_blank' href='${html_url}'>
              <h4 class='h6'>${name}</h4>
              <div class='stats'>
                <div>
                    ${feather.icons.star.toSvg()}
                    ${stargazers_count} stars
                </div>
                <div>
                    ${feather.icons.eye.toSvg()}
                    ${watchers_count} watchers
                </div>
                <div>
                   ${feather.icons['git-merge'].toSvg()}
                    ${forks_count} forks
                </div>
              </div>
            </a>
          </li>
        `).join('')}
      </ul>`;
  };
}

// ⚡️Class instance
new App();
