# EmbodiedLLM

[Open the project website](https://odessey159.github.io/EmbodiedLLM-website/)

English presentation of the execution framework, study summary, and recorded
case explorer. Built with static HTML, CSS, JavaScript, and original SVGs.

Run locally with `python3 -m http.server 8766 --bind 127.0.0.1`. No build step
or package installation is required. GitHub Pages publishes the root of main.

- index.html, styles.css, app.js: page layout and browser interactions.
- assets/architecture.svg: framework overview.
- assets/case-*.svg: desktop and mobile case diagrams.
- assets/study-data.json: the figures and events presented on the website.

The case explorer displays recorded events; it does not make model requests
or control a robot.
