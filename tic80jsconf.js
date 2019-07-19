// optional configuration for the tic80js build system

module.exports = {
    /* target: tic-80 version to use as the build target 
    * Must be one of: tic80, tic80pro, tic80uwp
    * Note that tic80uwp doesn't accept command line parameters at this time
    * thus the tic80upw option is not useful and may be removed in a future version
    * Default: 'tic80'
    */
    version:'tic80',
    /* compact: try to make the build js as small as possible
    * If true, the source will be compressed, minimized, and have as much whitespace 
    * removed as possible.
    * If false, the source will skip this step resulting in more readable, but much
    * less space-efficient code
    * Default: true
    */ 
    compact: true,
    /* input: the file to use as the root of the project to build
    * Default: '.'
    */
    input: 'tests/simple/index.js'
}
