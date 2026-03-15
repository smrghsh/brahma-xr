import restart from 'vite-plugin-restart';

export default {
    base: './', // ensures assets load correctly after build
    root: 'src/', // source files (index.html location)
    publicDir: '../static/', // static assets
    server: {
        host: true,
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
    },
    build: {
        outDir: '../../build/Basic', // build output folder
        emptyOutDir: true,
        sourcemap: true
    },
    plugins: [
        restart({ restart: [ '../static/**' ] })
    ]
};
