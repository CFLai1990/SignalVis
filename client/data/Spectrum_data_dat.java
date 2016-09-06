package spectrum;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

public class Spectrum_data_dat {
	private static int frames_count;
	private static int timecount;
	private static ArrayList<Single_spectrum_dat> all_frames_spectrum_data = new ArrayList<Single_spectrum_dat>();
	static int pkgNum = 0;
	static int maxData = 0;
	static int minData = 10000;
	public static void main(String[] args){	

		String fileName ="/Users/fenglu/Desktop/FFT.dat";
		 File file = new File(fileName);
		 InputStream in = null;
		 try {
			 in = new FileInputStream(file);
			 byte[] temp=new byte[8];
			 double[] header = new double[7];
			 int count = 0;
		     double d = 0;

			 while(count<7&&(in.read(temp))!= -1){   
     			d=Double.longBitsToDouble((((long)temp[7] << 56) +  
     				((long)(temp[6] & 0xff) << 48) +  
	   	                ((long)(temp[5] & 0xff) << 40) +  
	   	                ((long)(temp[4] & 0xff) << 32) +  
	   	                ((long)(temp[3] & 0xff) << 24) +  
	   	                ((temp[2] & 0xff) << 16) +  
	   	                ((temp[1] & 0xff) <<  8) +  
	   	                ((temp[0] & 0xff) <<  0)));  
     				header[count] = d;
     				System.out.println(count+":"+d);   	
     				count++;
     		}  	
			 timecount = (int)((long)header[5])/1000;
			 count = 0;
			 byte[] data = new byte[(int) header[6]]; 
			 frames_count = (int) header[4];
			 while((in.read(data))!=-1){
				 Single_spectrum_dat test = pkgSpObject(data,header);
				 all_frames_spectrum_data.add(test);
				 count++;
			 }
//频谱数据存储在 all_frames_spectrum_data 链表中
			 //System.out.println("list:"+all_frames_spectrum_data.get(3007).MaxData[0]);
			 System.out.println("framecount:"+count);
///////////处理之后的频谱数据
		     FileWriter fw = new FileWriter("/Users/fenglu/Desktop/spectrum.csv");
		     String header1 = "frameNum,scope,frequency\r\n";
		     fw.write(header1);
		     for (int i = 0; i < count ; i++) {
		     //int i=0;
		    	  StringBuffer str = new StringBuffer();
		    	  double step = (all_frames_spectrum_data.get(i).getEndFreq()-all_frames_spectrum_data.get(i).getStartFreq())/all_frames_spectrum_data.get(i).MaxData.length;
		    	  
		    	  for (int j = 0; j < all_frames_spectrum_data.get(i).MaxData.length; j++) {
		    		  double thisFre = j*step + all_frames_spectrum_data.get(i).getStartFreq();
		    		  thisFre = thisFre/1000000;
			    	  str.append(all_frames_spectrum_data.get(i).getNum()+","+all_frames_spectrum_data.get(i).MaxData[j]+","+thisFre+"\r\n");
			      }
			      fw.write(str.toString());
			      fw.flush();
		     }
		     fw.close();
 //////////////////////////
		     
			 System.out.println("framecount:"+count);
			 System.out.println("timecount:"+timecount);
			in.close();
		 } 
		 catch (IOException e) {
	         e.printStackTrace();
	         return;
	     }
	}
	public static Single_spectrum_dat pkgSpObject(byte[] data, double[] header){
		Single_spectrum_dat spInfo = new Single_spectrum_dat();
		if (header[0] == 4)
        {
            double bw = 0;
            switch((int)header[3])
            {
                case 0:
                    bw = 0.5;
                    break;
                case 1:
                    bw = 1;
                    break;
                case 2:
                    bw = 2;
                    break;
                case 3:
                    bw = 4;
                    break;
                case 4:
                    bw = 12;
                    break;
                case 5:
                    bw = 28;
                    break;
                case 6:
                    bw = 36;
                    break;
                case 7:
                    bw = 72;
                    break;
            }
            spInfo.setStartFreq(header[1] * 1e6 - bw * 1e6 / 2);
            spInfo.setEndFreq(header[1] * 1e6 + bw * 1e6 / 2);
            spInfo.ShowMaxData = new double[data.length/8];
            double d = 0;
            for(int i = 0;i<spInfo.ShowMaxData.length;i++){
            	d=Double.longBitsToDouble((((long)data[i*8+7] << 56) +  
         				((long)(data[i*8+6] & 0xff) << 48) +  
    	   	                ((long)(data[i*8+5] & 0xff) << 40) +  
    	   	                ((long)(data[i*8+4] & 0xff) << 32) +  
    	   	                ((long)(data[i*8+3] & 0xff) << 24) +  
    	   	                ((data[i*8+2] & 0xff) << 16) +  
    	   	                ((data[i*8+1] & 0xff) <<  8) +  
    	   	                ((data[i*8] & 0xff) <<  0))); 
            	//System.out.println(d);
            	spInfo.ShowMaxData[i] = d;	
            }
        spInfo.setNum(pkgNum);
        pkgNum++;
            return spInfo;
            
        }	
		int temp = (data[13] & 0xff) << 8|(data[12] & 0xff) ;
		spInfo.setPoints((long)Math.pow(2,temp ));
		temp = (data[15] & 0xff) << 8|(data[14] & 0xff) ;
		spInfo.setWindow(temp);
		temp = (data[17] & 0xff) << 8|(data[16] & 0xff) ;
		spInfo.setAvgType(temp);
		temp = (data[19] & 0xff) << 8|(data[18] & 0xff) ;
		spInfo.setAvgTimes(temp);
		temp =(data[21] & 0xff) << 8|(data[20] & 0xff) ;
		spInfo.setCicEnnable(temp);
		temp = (data[23] & 0xff) << 8|(data[22] & 0xff) ;
		spInfo.setCicRate(temp);
		temp = (data[25] & 0xff) << 8|(data[24] & 0xff) ;
		spInfo.setFirRate(temp);
		temp = (data[27] & 0xff) << 8|(data[26] & 0xff) ;
		spInfo.setFieGain(temp);
		temp = (data[31] & 0xff) << 24|(data[30]& 0xff)<<16 |(data[29] & 0xff) << 8|(data[28] & 0xff) ;
		spInfo.setBlandWidth(temp);
		temp = (data[39] & 0xff) << 56|(data[38]& 0xff)<<48 |(data[37] & 0xff) << 40|(data[36] & 0xff)<<32|(data[35] & 0xff) << 24|(data[34] & 0xff)<<16|(data[33] & 0xff) << 8|(data[32] & 0xff);
		double centerFreq = temp;
		temp =  (data[41] & 0xff) << 8|(data[40] & 0xff) ;
		spInfo.setBlandWidthEnum(temp);
		temp =  (data[43] & 0xff) << 8|(data[42] & 0xff) ;
		spInfo.setFrontGain(temp);
		temp =  (data[45] & 0xff) << 8|(data[44] & 0xff) ;
		spInfo.setRFAttenuation(temp);
		temp =  (data[47] & 0xff) << 8|(data[46] & 0xff) ;
		spInfo.setOutMidFreq(temp);
		temp =  (data[51] & 0xff) << 24|(data[50] & 0xff)<<16| (data[49] & 0xff) << 8|(data[48] & 0xff) ;
		spInfo.setSampleRate(temp);
		temp =  (data[53] & 0xff) << 8|(data[52] & 0xff) ;
		spInfo.setSweepGap(temp);
		temp =  (data[57] & 0xff) << 24|(data[56] & 0xff)<<16 |(data[55] & 0xff) << 8|(data[54] & 0xff) ;
		spInfo.setScanStep(temp);
		temp =  (data[59] & 0xff) << 8|(data[58] & 0xff) ;
		//System.out.println(centerFreq);
		if (centerFreq == 0)
        {
			centerFreq = 950 *1e6;
			spInfo.setScanStep(28000000);
        }
		spInfo.setCenterFreq(centerFreq);
	
	int len  = (int) spInfo.getPoints()*2;
	byte[] tdata = new byte[len];
	System.arraycopy(data, 62*2, tdata, 0, len);
	int t = 0;
	//System.out.println(spInfo.getScanStep());
	if(spInfo.getScanStep()!=0){
		t = (int)((spInfo.getPoints() - spInfo.getPoints() * spInfo.getScanStep() / spInfo.getSampleRate()) / 2);
		spInfo.setStartFreq(centerFreq-spInfo.getScanStep()/2);
		spInfo.setEndFreq(centerFreq+spInfo.getScanStep()/2);
	}
	else{
		t = (int)((spInfo.getPoints() - spInfo.getPoints() * 72 / 95) / 2);
        spInfo.setStartFreq(centerFreq -(spInfo.getSampleRate()*72.0/95)/ 2);
        spInfo.setEndFreq(centerFreq + (spInfo.getSampleRate()*72.0/95)/ 2);
	}
	byte[] temparray = new byte[len - t * 4];
	System.arraycopy(tdata, t*2, temparray, 0, temparray.length);
	spInfo.MaxData = new int[temparray.length/2];
	spInfo.ShowMaxData = null;
	//System.out.println(spInfo.MaxData.length);
	
//////////////////////////////
	for(int i = 0;i<spInfo.MaxData.length;i++){
		int tempreal = (temparray[i*2+1] & 0xff) << 8|(temparray[i*2] & 0xff) ;
		spInfo.MaxData[i]=tempreal;
		if(spInfo.MaxData[i] > maxData)
			maxData = spInfo.MaxData[i];
		if(spInfo.MaxData[i] < minData)
			minData = spInfo.MaxData[i];
		//System.out.println(spInfo.MaxData[i]);
	}
//////////////////////////////
	  spInfo.setNum(pkgNum);
      pkgNum++;
      //System.out.println("Num:"+spInfo.getNum());
      if(spInfo.getNum() == 3007){
    	  System.out.println(maxData);
    	  System.out.println(minData);
      }
	return spInfo;
	}
	public int getFrames_count() {
		return frames_count;
	}
	public int gettime_count(){
		return timecount;
	}
	public ArrayList<Single_spectrum_dat> getAll_frames_spectrum_data() {
		return all_frames_spectrum_data;
	}
	
}



