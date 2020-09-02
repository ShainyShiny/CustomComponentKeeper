/*!
 * CustomComponentKeeper for Server v1.0.0
 * by Shainy
 *
 * GitHub: https://github.com/shainy9969/CustomComponentKeeper
 */

(function() {
    let registerSystem = server.registerSystem.bind(server);

    function escape(string) {
        return string.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
    }

    server.registerSystem = function() {
        let system = registerSystem(...arguments);

        let registeredComponents = {};

        let registerComponent = system.registerComponent.bind(system);
        let hasComponent = system.hasComponent.bind(system);
        let getComponent = system.getComponent.bind(system);
        let applyComponentChanges = system.applyComponentChanges.bind(system);
        let destroyComponent = system.destroyComponent.bind(system);

        system.registerComponent = function(identifier) {
            if(registerComponent(...arguments)) {
                return (registeredComponents[identifier] = true);
            }
        };

        system.hasComponent = function(entity, identifier) {
            let hadComponent = hasComponent(...arguments);
            if(hadComponent !== false) {
                return hadComponent;
            }
            if(identifier in registeredComponents) {
                let tagComponent = getComponent(entity, "minecraft:tag");
                for(let i = 0; i < tagComponent.data.length; i++) {
                    let matched = tagComponent.data[i].match(new RegExp(`^${escape(identifier)}(.+)`));
                    if(matched) {
                        try {
                            let component = this.createComponent(entity, identifier);
                            component.data = JSON.parse(matched[1]);
                            this.applyComponentChanges(entity, component);
                            return true;
                        } catch(error) {
                            continue;
                        }
                    }
                }
                return false;
            }
        };

        system.getComponent = function(entity, identifier) {
            let gotComponent = getComponent(...arguments);
            if(gotComponent) {
                return gotComponent;
            }
            if(identifier in registeredComponents) {
                let tagComponent = getComponent(entity, "minecraft:tag");
                for(let i = 0; i < tagComponent.data.length; i++) {
                    let matched = tagComponent.data[i].match(new RegExp(`^${escape(identifier)}(.+)`));
                    if(matched) {
                        try {
                            let component = this.createComponent(entity, identifier);
                            component.data = JSON.parse(matched[1]);
                            this.applyComponentChanges(entity, component);
                            return component;
                        } catch(error) {
                            continue;
                        }
                    }
                }
            }
        };

        system.applyComponentChanges = function(entity, component) {
            if(applyComponentChanges(...arguments)) {
                if(component.__identifier__ in registeredComponents) {
                    let tagComponent = getComponent(entity, "minecraft:tag");
                    for(let i = 0; i < tagComponent.data.length; i++) {
                        let matched = tagComponent.data[i].match(new RegExp(`^${escape(component.__identifier__)}(.+)`));
                        if(matched) {
                            try {
                                JSON.parse(matched[1]);
                                tagComponent.data.splice(i, 1);
                                break;
                            } catch(error) {
                                continue;
                            }
                        }
                    }
                    tagComponent.data.push(component.__identifier__ + JSON.stringify(component.data));
                    applyComponentChanges(entity, tagComponent);
                }
                return true;
            }
        };

        system.destroyComponent = function(entity, identifier) {
            if(destroyComponent(...arguments)) {
                if(identifier in registeredComponents) {
                    let tagComponent = getComponent(entity, "minecraft:tag");
                    for(let i = 0; i < tagComponent.data.length; i++) {
                        let matched = tagComponent.data[i].match(new RegExp(`^${escape(component.__identifier__)}(.+)`));
                        if(matched) {
                            try {
                                JSON.parse(matched[1]);
                                tagComponent.data.splice(i, 1);
                                applyComponentChanges(entity, tagComponent);
                                return true;
                            } catch(error) {
                                continue;
                            }
                        }
                    }
                }
            }
        };

        return system;
    };
})();
