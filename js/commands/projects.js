module.exports = ({ api, config }) => {
  return {
    async list () {
      const projects = await api.listProjects();

      projects.forEach(project => {
        console.log(`${project.name} <${project.id}>`);
      })
    },
    async use (args) {
      const idOrName = args[0];
      const projects = await api.listProjects();
      const project = projects.find(p => p.id === idOrName || p.name === idOrName);

      if (project) {
        console.log(`Using ${idOrName}`);

        config.setProjectId(project.id);
      } else {
        console.error(`Project not found: ${idOrName}`);
      }
    }
  };
};