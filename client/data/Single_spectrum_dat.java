package spectrum;

public class Single_spectrum_dat {
	private long Points;
	private int Window;
	private int AvgType;
	private int AvgTimes;
	private int CicEnnable;
	private int CicRate;
	private int FirRate;
	private int FieGain;
	private int blandWidth;
	private double CenterFreq;
	private int BlandWidthEnum;
	private int FrontGain;
	private int RFAttenuation;
	private int OutMidFreq;
	private int SampleRate;
	private int SweepGap;
	private int ScanStep;
	private int WorkMode;
	private int num;
	private double StartFreq;
	private double EndFreq;
	public float[] amplitude;
	public double[] ShowMaxData;
	public int[] MaxData;
	public int getBlandWidth() {
		return blandWidth;
	}
	public void setBlandWidth(int blandWidth) {
		this.blandWidth = blandWidth;
	}
	public long getPoints() {
		return Points;
	}
	public void setPoints(long points) {
		Points = points;
	}
	public int getWindow() {
		return Window;
	}
	public void setWindow(int window) {
		Window = window;
	}
	public int getAvgType() {
		return AvgType;
	}
	public void setAvgType(int avgType) {
		AvgType = avgType;
	}
	public int getAvgTimes() {
		return AvgTimes;
	}
	public void setAvgTimes(int avgTimes) {
		AvgTimes = avgTimes;
	}
	public int getCicEnnable() {
		return CicEnnable;
	}
	public void setCicEnnable(int cicEnnable) {
		CicEnnable = cicEnnable;
	}
	public int getCicRate() {
		return CicRate;
	}
	public void setCicRate(int cicRate) {
		CicRate = cicRate;
	}
	public int getFirRate() {
		return FirRate;
	}
	public void setFirRate(int firRate) {
		FirRate = firRate;
	}
	public int getFieGain() {
		return FieGain;
	}
	public void setFieGain(int fieGain) {
		FieGain = fieGain;
	}
	public double getCenterFreq() {
		return CenterFreq;
	}
	public void setCenterFreq(double centerFreq) {
		this.CenterFreq = centerFreq;
	}
	public int getBlandWidthEnum() {
		return BlandWidthEnum;
	}
	public void setBlandWidthEnum(int blandWidthEnum) {
		BlandWidthEnum = blandWidthEnum;
	}
	public int getFrontGain() {
		return FrontGain;
	}
	public void setFrontGain(int frontGain) {
		FrontGain = frontGain;
	}
	public int getRFAttenuation() {
		return RFAttenuation;
	}
	public void setRFAttenuation(int rFAttenuation) {
		RFAttenuation = rFAttenuation;
	}
	public int getOutMidFreq() {
		return OutMidFreq;
	}
	public void setOutMidFreq(int outMidFreq) {
		OutMidFreq = outMidFreq;
	}
	public int getSampleRate() {
		return SampleRate;
	}
	public void setSampleRate(int sampleRate) {
		SampleRate = sampleRate;
	}
	public int getSweepGap() {
		return SweepGap;
	}
	public void setSweepGap(int sweepGap) {
		SweepGap = sweepGap;
	}
	public int getScanStep() {
		return ScanStep;
	}
	public void setScanStep(int scanStep) {
		ScanStep = scanStep;
	}
	public int getWorkMode() {
		return WorkMode;
	}
	public void setWorkMode(int workMode) {
		WorkMode = workMode;
	}
	public int getNum() {
		return num;
	}
	public void setNum(int num) {
		this.num = num;
	}
	public double getStartFreq() {
		return StartFreq;
	}
	public void setStartFreq(double startFreq) {
		StartFreq = startFreq;
	}
	public double getEndFreq() {
		return EndFreq;
	}
	public void setEndFreq(double endFreq) {
		EndFreq = endFreq;
	}
	
}
