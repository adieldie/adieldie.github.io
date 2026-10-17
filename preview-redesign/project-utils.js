export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function filterProjects(items,category,query){
 const term=normalize(query);
 return items.filter(project=>(category==='Todos'||project.category===category)&&normalize([project.title,project.summary,...(project.techStack||[]),...(project.tags||[])].join(' ')).includes(term));
}
