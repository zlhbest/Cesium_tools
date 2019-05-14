uniform sampler2D shadowMap_texture; 
uniform mat4 shadowMap_matrix; 
uniform vec3 shadowMap_lightDirectionEC; 
uniform vec4 shadowMap_lightPositionEC; 
uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; 
uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; 
#ifdef LOG_DEPTH 
varying vec3 v_logPositionEC; 
#endif 
vec4 getPositionEC() 
{ 
    return vec4(v_positionEC, 1.0); 
} 
vec3 getNormalEC() 
{ 
    return normalize(v_normal); 
} 
void applyNormalOffset(inout vec4 positionEC, vec3 normalEC, float nDotL) 
{ 
    float normalOffset = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.x; 
    float normalOffsetScale = 1.0 - nDotL; 
    vec3 offset = normalOffset * normalOffsetScale * normalEC; 
    positionEC.xyz += offset; 
} 
void main() 
{ 
    czm_shadow_receive_main(); 
    vec4 positionEC = getPositionEC(); 
    vec3 normalEC = getNormalEC(); 
    float depth = -positionEC.z; 
    czm_shadowParameters shadowParameters; 
    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; 
    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; 
    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; 
    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; 
    float maxDepth = shadowMap_cascadeSplits[1].w; 
    // Stop early if the eye depth exceeds the last cascade 
    if (depth > maxDepth) 
    { 
        return; 
    } 
    // Get the cascade based on the eye-space depth 
    vec4 weights = czm_cascadeWeights(depth); 
    // Apply normal offset 
    float nDotL = clamp(dot(normalEC, shadowMap_lightDirectionEC), 0.0, 1.0); 
    applyNormalOffset(positionEC, normalEC, nDotL); 
    // Transform position into the cascade 
    vec4 shadowPosition = czm_cascadeMatrix(weights) * positionEC; 
    // Get visibility 
    shadowParameters.texCoords = shadowPosition.xy; 
    shadowParameters.depth = shadowPosition.z; 
    shadowParameters.nDotL = nDotL; 
    float visibility = czm_shadowVisibility(shadowMap_texture, shadowParameters); 
    // Fade out shadows that are far away 
    float shadowMapMaximumDistance = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.z; 
    float fade = max((depth - shadowMapMaximumDistance * 0.8) / (shadowMapMaximumDistance * 0.2), 0.0); 
    visibility = mix(visibility, 1.0, fade); 
    gl_FragColor.rgb *= visibility; 
} 