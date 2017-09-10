import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.JSSourceFile;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;

/**
 * Created by asavan on 01.09.2017.
 */
public class JavascriptCompiler {

    private static void doWork() throws IOException {
        File curr = new File(".");
        System.out.print(curr.getAbsolutePath());
        String gamejs = FileUtils.readFileToString(new File("../game.js"));
        String compiled = compileFile(gamejs);
        System.out.print(compiled);
        FileUtils.writeStringToFile(new File("../game2.min.js"), compiled);
    }

    public static void main(String[] args) throws IOException {
        doWork();
    }

    private static String compileFile(String sourceText) {
        Compiler compiler = new Compiler();
        CompilerOptions compilerOptions = new CompilerOptions();
        CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(compilerOptions);
        JSSourceFile jsSourceFile = JSSourceFile.fromCode("input.js", sourceText);
        JSSourceFile jsOutputFile = JSSourceFile.fromCode("output.js", "");
        compiler.compile(jsOutputFile, jsSourceFile, compilerOptions);
        return compiler.toSource();
    }

}