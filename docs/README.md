## 📚 Contributing to Documentation

We'd love your help improving the Brahma-xr documentation! Here’s how you can contribute:


###  How to Contribute

1. **Install Dependencies**  

   ```bash
   npm install

2.  **Write JSDoc Comments**

Add or improve JSDoc-style comments in `.js` files inside the `src/` directory. Use tags like:

- `@param`
- `@returns`
- `@example`
- `@class`
- `@private` or `@public`

#### **Example**

```js
/**
 * Starts the Brahma WebSocket server.
 *
 * @example
 * const server = new BrahmaServer({ port: 8080 });
 * server.run();
 */
```

3.  **Generate the Docs**

Run the following command:

```bash
npm run generate-docs
``` 

4.  **Preview the Docs**

After generating, open the following file in your browser:

```bash
docs/index.html
```

### Documentation Guidelines

- We follow the **JSDoc** standard for documentation across this project.  
 To learn more about writing JSDoc-style comments, refer to the official documentation:

    👉 [JSDoc Reference Guide](https://jsdoc.app/)

- **Do not edit HTML files inside the `docs/` folder directly.**  
  These files are auto-generated and will be overwritten every time you run the docs generator.

-  **Edit JSDoc comments in `.js` files instead.**  
  Make your changes in the source code (typically inside the `src/` folder) using proper JSDoc syntax.

