import { COMMANDS, data, cwd } from './constant.js';

const font = 'Slant';
figlet.defaults({ fontPath: 'https://cdn.jsdelivr.net/npm/figlet/fonts' });
figlet.preloadFonts([font], ready);

function prompt() {
  return `<green>${data.USER}@${data.SERVER}</green>:<orange>${cwd}</orange>$ `;
}
$.terminal.xml_formatter.tags.green = (attrs) => {
  return `[[;#05ce91;]`;
};

const command_list = Object.keys(COMMANDS);
const commands = command_list.reduce((acc, cmd) => {
  acc[cmd] = COMMANDS[cmd].exec;
  return acc;
}, {});
const rex = new RegExp(`^\s*(${command_list.join('|')}) (.*)$`);

const term = $('body').terminal(commands, {
  greetings: false,
  checkArity: false,
  completion(string) {
    // in every function we can use `this` to reference term object
    const cmd = this.get_command();
    // we process the command to extract the command name
    // at the rest of the command (the arguments as one string)
    const { name, rest } = $.terminal.parse_command(cmd);
    if (['cd', 'ls', 'cat'].includes(name)) {
      if (rest.startsWith('~/')) {
        return data.DIRS.map((dir) => `~/${dir}`);
      }
      if (cwd === data.ROOT) {
        return data.DIRS;
      }
    }
    return command_list;
  },
  exit: false,
  prompt,
});

term.pause();

$.terminal.new_formatter((str) => {
  return str.replace(rex, function (_, command, args) {
    return `<white>${command}</white> <aqua>${args}</aqua>`;
  });
});

term.on('click', '.directory', function () {
  const dir = $(this).text();
  term.exec(`cd ~/${dir}`);
});
term.on('click', '.command', function () {
  const cmd = $(this).text();
  term.exec(cmd);
});

function render(text) {
  const cols = term.cols();
  return trim(
    figlet.textSync(text, {
      font: font,
      width: cols,
      whitespaceBreak: true,
    })
  );
}

function trim(str) {
  return str.replace(/[\n\s]+$/, '');
}

function rand(max) {
  return Math.floor(Math.random() * (max + 1));
}

function ready() {
  const seed = rand(256);
  term
    .echo(() => rainbow(render('Terminal Portfolio'), seed), { ansi: false })
    .echo(
      '<white>Welcome to my Terminal Portfolio</white>\n\n' +
        'Type (or click) <yellow class="command">help</yellow> to list available clickable commands\n\n' +
        '- Press <white>TAB</white> to autocomplete commands and directories\n' +
        '- Double <white>TAB</white> to get suggestions\n' +
        '- Click on the command to execute it\n'
    )
    .resume();
}

figlet.defaults({ fontPath: 'https://unpkg.com/figlet/fonts/' });
figlet.preloadFonts([font], ready);

function rainbow(string, seed) {
  return lolcat
    .rainbow(
      function (char, color) {
        char = $.terminal.escape_brackets(char);
        return `[[;${hex(color)};]${char}]`;
      },
      string,
      seed
    )
    .join('\n');
}

function hex(color) {
  return (
    '#' +
    [color.red, color.green, color.blue]
      .map((n) => {
        return n.toString(16).padStart(2, '0');
      })
      .join('')
  );
}
