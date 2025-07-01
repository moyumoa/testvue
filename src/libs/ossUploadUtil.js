import OSS from 'ali-oss';
import api from '../api';

export async function uploadToOss(file, fileName) {
  const res = await api.getSts();
  if (res.code === 0) {
    const data = res.data;
    const client = new OSS({
      region: data.region,
      secure: true,
      endpoint: data.endPoint,
      accessKeyId: data.stsData.credentials.accessKeyId,
      accessKeySecret: data.stsData.credentials.accessKeySecret,
      stsToken: data.stsData.credentials.securityToken,
      refreshSTSTokenInterval: 300000,
      timeout: 600000,
      bucket: data.bucketName
    });
    const nameUsed = fileName || file.name || '';
    const point = nameUsed.lastIndexOf('.');
    const remoteName =
      'xm/file/' + Date.now() + '_' + nameUsed.substr(point);
    return await client.put(remoteName, file);
  }
  throw new Error('获取OSS凭证失败');
}