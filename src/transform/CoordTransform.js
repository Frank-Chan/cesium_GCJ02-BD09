const BD_FACTOR = (3.14159265358979324 * 3000.0) / 180.0; //x_PI
const PI = 3.1415926535897932384626
const RADIUS = 6378245.0
const EE = 0.00669342162296594323

/**
 * 坐标转换类。常用坐标系的转换，包括WGS84（地理坐标，EPSG：4326，经纬度）与WebMercator（投影坐标，EPSG：3857）、百度坐标系(BD-09)、火星坐标系(GCJ-02)的相互转换。
 * WebMercator投影坐标系（EPSG:3857）：Google Maps、Bing Maps、OSM和大部分的ArcGIS Online使用的地图投影，WebMercator使用的是球形（而不是椭球）参数方程。
 * WGS84:国际标准，Google、Bing、OSM、GPS坐标系;
 * GCJ-02：国测局坐标系，高德地图、腾讯地图坐标系;
 * BD-09：百度地图坐标系，在GCJ-02的基础上进行了二次加密。
*/
class CoordTransform {
	
 /**
 * WGS84地理坐标转WebMercator投影坐标
 * @param {Number} lon 经度（单位为度）
 * @param {Number} lat 纬度（单位为度）
 * @returns {Array<Number>} 返回WebMercator投影坐标数组（单位为米）
 * @example
 * Cesium.CoordTransform.wgs84TowebMercator(114.397433, 22.909235)
 */
 static wgs84TowebMercator (lng, lat) {
	let WMP = new WebMercatorProjection();
	let cartesian3 = WMP.project(Cartographic.fromDegrees(lng, lat))
	let x = parseFloat(cartesian3.x.toFixed(2));
	let y = parseFloat(cartesian3.y.toFixed(2));
	return [x,y];
 }

/**
 * WGS84地理坐标包围盒转WebMercator投影坐标包围盒
 * @param {Object} bb WGS84包围盒对象，形如 {north, east, south, west}（单位为度）
 * @returns {Object} 返回WebMercator包围盒对象，形如 {north, east, south, west}（单位为米）
 * @example
 * Cesium.CoordTransform.wgs84TowebMercatorBB({north:22.909235,east:113.397433,south:21.909235,west:114.397433})
 */
 static wgs84TowebMercatorBB (bb) {
	let WMP = new WebMercatorProjection();
	let sw = WMP.project(Cartographic.fromDegrees(bb.west,bb.south));
	let ne = WMP.project(Cartographic.fromDegrees(bb.east,bb.north));
	return {
        north: ne.y,
        east: ne.x,
        south: sw.y,
        west: sw.x
    };
}

/**
 * WebMercator投影坐标转WGS84地理坐标
 * @param {Number} x 经度（单位为米）
 * @param {Number} y 纬度（单位为米）
 * @returns {Array<Number>} 返回WGS84坐标数组（单位为度）
 * @example
 * Cesium.CoordTransform.webMercatorToWgs84(12734663.99, 2621045.83)
 */
 static webMercatorToWgs84 (x, y) {
	let WMP = new WebMercatorProjection();
    let cartographic = WMP.unproject(new Cartesian3(x, y))	
	let lng = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
	let lon = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
    return [lng, lon];
}

/**
 * WebMercator投影坐标包围盒转WGS84地理坐标包围盒
 * @param {Object} bb WebMercator包围盒对象，形如 {north, east, south, west}（单位为米）
 * @returns {Object} 返回WGS84包围盒对象，形如 {north, east, south, west}（单位为度）
 * @example
 * Cesium.CoordTransform.webMercatorToWgs84BB({north: 2621045, east: 12623344, south: 2500631, west: 12734663})
 */
 static webMercatorToWgs84BB (bb) {
	let WMP = new WebMercatorProjection();
	let sw = WMP.unproject(new Cartesian3(bb.west,bb.south));
	let ne = WMP.unproject(new Cartesian3(bb.east,bb.north));
	return {
        north: Cesium.Math.toDegrees(ne.latitude),
        east: Cesium.Math.toDegrees(ne.longitude),
        south: Cesium.Math.toDegrees(sw.latitude),
        west: Cesium.Math.toDegrees(sw.longitude)
    }
}

/**
 * 百度坐标转火星坐标
 * @param {Number} bd_lon 百度经度
 * @param {Number} bd_lat 百度纬度
 * @returns {Array<Number>} 返回火星坐标数组
 * @example
 * Cesium.CoordTransform.bd09togcj02(114.397433, 22.909235)
 */
  static bd09togcj02(lng, lat) {
    let x = +lng - 0.0065
    let y = +lat - 0.006
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * BD_FACTOR)
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * BD_FACTOR)
    let gg_lng = z * Math.cos(theta)
    let gg_lat = z * Math.sin(theta)
    return [gg_lng, gg_lat]
  }

/**
 * 火星坐标转百度坐标
 * @param {Number} lng 火星坐标经度
 * @param {Number} lat 火星坐标纬度
 * @returns {Array<Number>} 返回百度坐标数组
 * @example
 * Cesium.CoordTransform.gcj02tobd09(114.397433, 22.909235)
 */
 gcj02tobd09 (lng, lat) {
    lat = +lat
    lng = +lng
    let z =
      Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * BD_FACTOR)
    let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * BD_FACTOR)
    let bd_lng = z * Math.cos(theta) + 0.0065
    let bd_lat = z * Math.sin(theta) + 0.006
    return [bd_lng, bd_lat]
  }

/**
 * WGS84坐标转GCj02坐标
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @returns {Array<Number>} 返回GCJ02坐标数组
 * @example
 * Cesium.CoordTransform.wgs84togcj02(114.397433, 22.909235)
 */
 wgs84togcj02(lng, lat) {
    lat = +lat
    lng = +lng
    if (this.out_of_china(lng, lat)) {
      return [lng, lat]
    } else {
      let d = this.delta(lng, lat)
      return [lng + d[0], lat + d[1]]
    }
  }

/**
 * GCJ02坐标转WGS84坐标
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @returns {Array<Number>} 返回WGS84坐标数组
 * @example
 * Cesium.CoordTransform.gcj02towgs84(114.397433, 22.909235)
 */
 gcj02towgs84 (lng, lat) {
    lat = +lat
    lng = +lng
    if (this.out_of_china(lng, lat)) {
      return [lng, lat]
    } else {
      let d = this.delta(lng, lat)
      let mgLng = lng + d[0]
      let mgLat = lat + d[1]
      return [lng * 2 - mgLng, lat * 2 - mgLat]
    }
  }

  
/**
 * WGS84坐标转百度坐标
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @returns {Array<Number>} 返回百度坐标数组
 * @example
 * Cesium.CoordTransform.wgs84tobd09(114.397433, 22.909235)
 */
 wgs84tobd09 (lng, lat) {
    let gcjCoords = this.wgs84togcj02(lng, lat);
    return this.gcj02tobd09(gcjCoords[0], gcjCoords[1]);
}

/**
 * 百度坐标转WGS84坐标
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @returns {Array<Number>} 返回WGS84坐标数组
 * @example
 * Cesium.CoordTransform.bd09towgs84(114.397433, 22.909235)
 */
 bd09towgs84 (lng, lat) {
    let gcjCoords = this.bd09togcj02(lng, lat);
    return this.gcj02towgs84(gcjCoords[0], gcjCoords[1]);
}


  /**
   *
   * @param lng
   * @param lat
   * @returns {number[]}
   */
  static delta(lng, lat) {
    let dLng = this.transformLng(lng - 105, lat - 35)
    let dLat = this.transformLat(lng - 105, lat - 35)
    const radLat = (lat / 180) * PI
    let magic = Math.sin(radLat)
    magic = 1 - EE * magic * magic
    const sqrtMagic = Math.sqrt(magic)
    dLng = (dLng * 180) / ((RADIUS / sqrtMagic) * Math.cos(radLat) * PI)
    dLat = (dLat * 180) / (((RADIUS * (1 - EE)) / (magic * sqrtMagic)) * PI)
    return [dLng, dLat]
  }

/**
 * 计算经度差
 * @private
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @returns {Number} 返回经度差值
 */
  static transformLng(lng, lat) {
    lat = +lat
    lng = +lng
    let ret =
      300.0 +
      lng +
      2.0 * lat +
      0.1 * lng * lng +
      0.1 * lng * lat +
      0.1 * Math.sqrt(Math.abs(lng))
    ret +=
      ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
        2.0) /
      3.0
    ret +=
      ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) /
      3.0
    ret +=
      ((150.0 * Math.sin((lng / 12.0) * PI) +
        300.0 * Math.sin((lng / 30.0) * PI)) *
        2.0) /
      3.0
    return ret
  }

/**
 * 计算纬度差
 * @private
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @returns {Number} 返回纬度差值
 */
  static transformLat(lng, lat) {
    lat = +lat
    lng = +lng
    let ret =
      -100.0 +
      2.0 * lng +
      3.0 * lat +
      0.2 * lat * lat +
      0.1 * lng * lat +
      0.2 * Math.sqrt(Math.abs(lng))
    ret +=
      ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
        2.0) /
      3.0
    ret +=
      ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) /
      3.0
    ret +=
      ((160.0 * Math.sin((lat / 12.0) * PI) +
        320 * Math.sin((lat * PI) / 30.0)) *
        2.0) /
      3.0
    return ret
  }

/**
 * 判断是否在国内，不在国内则不做偏移
 * @private
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @returns {boolean}
 */
  static out_of_china(lng, lat) {
    lat = +lat
    lng = +lng
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
  }
}
export default CoordTransform
