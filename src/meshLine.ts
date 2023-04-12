import * as THREE from 'three';
// import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

export function LineWeight(startPoint: THREE.Vector3, endPoint: THREE.Vector3, width?: number | undefined, material?: THREE.MeshBasicMaterial | THREE.LineBasicMaterial | undefined, segments?: number | undefined) {
    if (!width)
        width = 0
    if (!material)
        material = new THREE.MeshBasicMaterial()
    if (!segments)
        segments = 4
    if (width == 0) {
        const smooth_line_geometry = new THREE.BufferGeometry()
        const bufferGeometry = [startPoint.x, startPoint.y, startPoint.z, endPoint.x, endPoint.y, endPoint.z]
        const vertices = new Float32Array(bufferGeometry)
        smooth_line_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        const circle_line = new THREE.LineSegments(smooth_line_geometry, material);
        return circle_line
    }
    else {
        const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
        const height = direction.length()

        const geometry = new THREE.CylinderGeometry(width, width, height, segments, 1, false);
        const cylinder = new THREE.Mesh(geometry, material);

        const midpoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
        cylinder.position.set(midpoint.x, midpoint.y, midpoint.z);
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        return cylinder
    }
}
