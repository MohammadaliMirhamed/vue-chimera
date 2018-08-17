import Vue from 'vue';
import VueChimera from './index';
import Resource from './Resource';


export function NuxtPlugin ({ beforeNuxtRender, isDev }) {
    if (beforeNuxtRender) {
        beforeNuxtRender(async ({ Components, nuxtState }) => {
            for (let i = 0, len = Components.length; i < len; i++) {
                let component = Components[i];
                const options = component.options;
                nuxtState.chimera = {};

                if (options.chimera) {
                    let nuxtChimera = {};
                    for (let key in options.chimera.resources) {
                        if (key && key.charAt(0) === '$')
                            continue;

                        let resource = options.chimera.resources[key];

                        if (resource.requestConfig && !resource.requestConfig.url) {
                            continue;
                        }


                        if (resource && typeof resource !== 'function' && resource.prefetch) {
                            resource = resource && resource._data ? resource : Resource.from(resource)
                            try {
                                if (isDev)
                                    console.log('  Prefetching: ' + resource.requestConfig.url)
                                let response = await resource.execute();
                                resource._data = response.data;
                            } catch (e) {}
                            resource.ssrPrefetched = true;
                            options.chimera.resources[key] = nuxtChimera[key] = resource;
                        }
                    }
                    nuxtState.chimera[i] = nuxtChimera;
                }
            }
        });
    }
}