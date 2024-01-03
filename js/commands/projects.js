module.exports = ({ api, config }) => {
  return {
    async list () {
      const projects = await api.listProjects();

      if (projects?.length) {
        console.log(``);

        projects.forEach(project => {
          console.log(`${project.name} <${project.id}>`);

          if (project.scripts?.length) {
            console.log(`  Scripts:`);
            project.scripts.forEach(script => {
              console.log(`    - ${script.name} <${script.id}>`);
            });
          }

          if (project.scenarios?.length) {
            console.log(`  Scenarios:`);
            project.scenarios.forEach(scenario => {
              console.log(`    - ${scenario.name} <${scenario.id}> <${scenario.shortcut}>`);
            });
          }

          console.log(``);
        });
      } else {
        console.log(`No projects found!`);
      }
    },
    async use (args) {
      const idOrName = args[0];
      const projects = await api.listProjects();
      const project = projects.find(p => p.id === idOrName || p.name === idOrName);

      if (project) {
        console.log(`Using ${project.name} <${project.id}>`);

        config.setProjectId(project.id);
      } else if (idOrName) {
        console.error(`Project not found: ${idOrName}`);
      } else {
        console.error(`Project not specified!`);
      }
    }
  };
};
